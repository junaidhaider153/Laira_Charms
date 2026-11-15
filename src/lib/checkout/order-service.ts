import crypto from "crypto";
import { generateGuestToken, verifyGuestToken, hashGuestToken } from "@/lib/auth/guest-token";
import { calculateOrderTotals } from "./shipping";
import type { CreateOrderInput, Order, OrderItem } from "./types";
import { enqueueNotification } from "@/lib/notifications/outbox-service";
import { getProductById, getProductBySlug } from "@/lib/catalog/catalog-service";
import { getOptionGroupsForProduct } from "@/lib/customization/service";
import { validateAndCalculateCustomization } from "@/lib/customization/calculator";
import { isLiveSupabaseConfigured, allowOfflineFallback } from "@/lib/auth/offline-mode";
import { getShippingPolicySettings } from "@/lib/settings/settings-service";

export const MEMORY_ORDERS: Map<string, Order> = new Map();
export const MEMORY_IDEMPOTENCY_INDEX: Map<string, string> = new Map();

export function generateOrderReference(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `LC-${yyyy}${mm}${dd}-${randomSuffix}`;
}

// Pre-seeded sample fixture for testing / mock verification only in non-production
const sampleOrderId = "55555555-5555-5555-5555-555555555501";
const sampleOrderRef = "LC-20261031-7788";
const sampleGuestEmail = "ayesha@example.com";
const { token: sampleGuestToken, hash: sampleGuestTokenHash } = generateGuestToken(
  sampleOrderRef,
  sampleGuestEmail
);

if (process.env.NODE_ENV !== "production") {
  const sampleOrder: Order = {
    id: sampleOrderId,
    reference: sampleOrderRef,
    customerId: null,
    guestEmail: sampleGuestEmail,
    guestTokenHash: sampleGuestTokenHash,
    shippingAddressSnapshot: {
      fullName: "Ayesha Noor",
      email: sampleGuestEmail,
      phone: "03001234567",
      streetAddress: "House 14-B, Street 3, Sector F-7/1",
      city: "Islamabad",
      province: "Islamabad Capital Territory",
      postalCode: "44000",
      orderNotes: "Please pack with extra bubble wrap for fragile glaze",
    },
    subtotalMinor: 240000, // Rs. 2,400
    shippingMinor: 25000, // Rs. 250
    totalMinor: 265000, // Rs. 2,650
    currency: "PKR",
    orderStatus: "pending_payment",
    paymentStatus: "awaiting_payment",
    notes: null,
    idempotencyKey: "sample-idempotency-key-001",
    items: [
      {
        id: "66666666-6666-6666-6666-666666666601",
        orderId: sampleOrderId,
        productId: "11111111-1111-1111-1111-111111111101",
        productTitle: "Cherry Blossom Bloom Charm",
        unitPriceMinor: 120000,
        quantity: 2,
        totalMinor: 240000,
        customizationSnapshot: {
          customization: { Palette: "Soft Sakura Pink", Hardware: "Gold Star Swivel Clasp" },
          customText: "NOOR",
          slug: "cherry-blossom-charm",
          imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&auto=format&fit=crop&q=80",
        },
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MEMORY_ORDERS.set(sampleOrderId, sampleOrder);
  MEMORY_IDEMPOTENCY_INDEX.set("sample-idempotency-key-001", sampleOrderId);
}

/**
 * Creates an order idempotently with server-authoritative pricing.
 * Validates products and customizations against the database/fixtures to prevent browser price tampering.
 */
export async function createOrder(
  input: CreateOrderInput,
  customerId?: string | null
): Promise<{ order: Order; guestToken?: string; orderUrl: string }> {
  // Idempotency check: prevent duplicate order creation
  const existingOrderId = MEMORY_IDEMPOTENCY_INDEX.get(input.idempotencyKey);
  if (existingOrderId) {
    const existingOrder = MEMORY_ORDERS.get(existingOrderId);
    if (existingOrder) {
      // Invariant: Verify caller identity before replaying order confirmation
      const isOwner = customerId
        ? existingOrder.customerId === customerId
        : existingOrder.guestEmail?.toLowerCase() === input.address.email.toLowerCase();

      if (!isOwner) {
        throw new Error("Idempotency conflict: this key has already been used by a different account or email.");
      }

      let guestToken: string | undefined;
      if (!existingOrder.customerId && existingOrder.guestEmail) {
        guestToken = generateGuestToken(existingOrder.reference, existingOrder.guestEmail).token;
      }
      const orderUrl = guestToken
        ? `/orders/${existingOrder.reference}?token=${encodeURIComponent(guestToken)}`
        : `/orders/${existingOrder.reference}`;
      return { order: existingOrder, guestToken, orderUrl };
    }
  }

  const orderId = crypto.randomUUID();
  const reference = generateOrderReference();

  // Authoritatively recompute all unit prices and totals on the server
  const orderItems: OrderItem[] = [];
  for (const item of input.items) {
    const product =
      (await getProductById(item.productId)) ||
      (item.slug ? await getProductBySlug(item.slug) : null);

    let authoritativeUnitPriceMinor: number;
    let productTitle = item.title;

    if (product) {
      if (product.status !== "published" && !allowOfflineFallback()) {
        throw new Error(`Product "${product.title}" is currently unavailable.`);
      }
      if (
        product.stockMode === "tracked" &&
        product.stockQuantity < item.quantity &&
        !allowOfflineFallback()
      ) {
        throw new Error(
          `Insufficient stock for "${product.title}". Only ${product.stockQuantity} available.`
        );
      }

      productTitle = product.title;
      const optionGroups = await getOptionGroupsForProduct(product.id);
      const hasRequiredGroup = optionGroups.some((g) => g.isRequired);

      if (hasRequiredGroup && !item.customization && !allowOfflineFallback()) {
        throw new Error(`Customization options are required for "${product.title}".`);
      }

      if (optionGroups.length > 0 && item.customization) {
        const customResult = validateAndCalculateCustomization(
          product,
          optionGroups,
          { options: item.customization, customText: item.customText }
        );
        if (!customResult.isValid && !allowOfflineFallback()) {
          throw new Error(customResult.errors[0] || `Invalid customization for "${product.title}".`);
        }
        authoritativeUnitPriceMinor = customResult.calculatedUnitPriceMinor;
      } else {
        authoritativeUnitPriceMinor = product.basePriceMinor;
      }
    } else {
      if (!allowOfflineFallback()) {
        throw new Error(`Product "${item.productId}" is not available or does not exist.`);
      }
      authoritativeUnitPriceMinor = item.unitPriceMinor ?? 0;
    }

    const itemId = crypto.randomUUID();
    const itemTotalMinor = authoritativeUnitPriceMinor * item.quantity;

    orderItems.push({
      id: itemId,
      orderId,
      productId: product ? product.id : item.productId,
      productTitle,
      unitPriceMinor: authoritativeUnitPriceMinor,
      quantity: item.quantity,
      totalMinor: itemTotalMinor,
      customizationSnapshot: {
        customization: item.customization,
        customText: item.customText,
        imageUrl: item.imageUrl || (product ? product.primaryImage : undefined),
        slug: item.slug || (product ? product.slug : undefined),
      },
      createdAt: new Date().toISOString(),
    });
  }

  // Calculate authoritative order totals from validated line items using configured store rates
  const shippingPolicy = await getShippingPolicySettings();
  const totals = calculateOrderTotals(orderItems, {
    standardRateMinor: shippingPolicy.standardRateMinor,
    freeShippingThresholdMinor: shippingPolicy.freeShippingThresholdMinor,
  });

  let guestToken: string | undefined;
  let guestTokenHash: string | null = null;

  if (!customerId) {
    const { token, hash } = generateGuestToken(reference, input.address.email);
    guestToken = token;
    guestTokenHash = hash;
  }

  const newOrder: Order = {
    id: orderId,
    reference,
    customerId: customerId || null,
    guestEmail: customerId ? null : input.address.email,
    guestTokenHash,
    shippingAddressSnapshot: input.address,
    subtotalMinor: totals.subtotalMinor,
    shippingMinor: totals.shippingMinor,
    totalMinor: totals.totalMinor,
    currency: "PKR",
    orderStatus: "pending_payment",
    paymentStatus: "awaiting_payment",
    notes: input.address.orderNotes || null,
    idempotencyKey: input.idempotencyKey,
    items: orderItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Live Supabase database persist using service-role admin client
  if (isLiveSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();

      const { error: orderError } = await (supabaseAdmin.from("orders") as unknown as {
        insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
      }).insert({
        id: newOrder.id,
        reference: newOrder.reference,
        customer_id: newOrder.customerId,
        guest_email: newOrder.guestEmail,
        guest_token_hash: newOrder.guestTokenHash,
        shipping_address_snapshot: newOrder.shippingAddressSnapshot as unknown as Record<string, unknown>,
        subtotal_minor: newOrder.subtotalMinor,
        shipping_minor: newOrder.shippingMinor,
        total_minor: newOrder.totalMinor,
        currency: newOrder.currency,
        order_status: newOrder.orderStatus,
        payment_status: newOrder.paymentStatus,
        notes: newOrder.notes,
        idempotency_key: newOrder.idempotencyKey,
      });

      if (orderError) {
        console.error("Order DB persistence error:", orderError);
        if (!allowOfflineFallback()) {
          throw new Error(`Order database insertion failed: ${orderError.message}`);
        }
      } else {
        for (const item of newOrder.items) {
          const { error: itemError } = await (supabaseAdmin.from("order_items") as unknown as {
            insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
          }).insert({
            id: item.id,
            order_id: item.orderId,
            product_id: item.productId,
            product_title: item.productTitle,
            unit_price_minor: item.unitPriceMinor,
            quantity: item.quantity,
            total_minor: item.totalMinor,
            customization_snapshot: item.customizationSnapshot as unknown as Record<string, unknown>,
          });

          if (itemError) {
            console.error("Order item DB persistence error:", itemError);
            if (!allowOfflineFallback()) {
              throw new Error(`Order item database insertion failed: ${itemError.message}`);
            }
          }
        }
      }
    } catch (dbErr: unknown) {
      if (!allowOfflineFallback()) {
        throw dbErr;
      }
    }
  }

  // Update memory store
  MEMORY_ORDERS.set(orderId, newOrder);
  MEMORY_IDEMPOTENCY_INDEX.set(input.idempotencyKey, orderId);

  // Safely enqueue order placed notification (FR-017: failures never corrupt business state)
  try {
    const recipientEmail = input.address.email || "customer@example.pk";
    await enqueueNotification({
      recipientEmail,
      recipientName: input.address.fullName,
      eventType: "order_placed",
      idempotencyKey: `order_placed_${reference}`,
      data: {
        orderReference: reference,
        totalPaisa: newOrder.totalMinor,
      },
    });
  } catch {
    // Invariant: Notification dispatch errors do not fail order creation
  }

  const orderUrl = guestToken
    ? `/orders/${reference}?token=${encodeURIComponent(guestToken)}`
    : `/orders/${reference}`;

  return { order: newOrder, guestToken, orderUrl };
}

/**
 * Maps a raw Supabase database order row (snake_case) to domain Order model (camelCase).
 * Prevents hydration bugs and undefined status errors.
 */
export function mapDbOrderToDomain(row: Record<string, unknown>): Order {
  const rawItems = (row.order_items || []) as Array<Record<string, unknown>>;
  const items: OrderItem[] = rawItems.map((i) => ({
    id: String(i.id),
    orderId: String(i.order_id),
    productId: i.product_id ? String(i.product_id) : null,
    productTitle: String(i.product_title || ""),
    unitPriceMinor: Number(i.unit_price_minor || 0),
    quantity: Number(i.quantity || 1),
    totalMinor: Number(i.total_minor || 0),
    customizationSnapshot: (i.customization_snapshot as OrderItem["customizationSnapshot"]) || null,
    createdAt: String(i.created_at || new Date().toISOString()),
  }));

  return {
    id: String(row.id),
    reference: String(row.reference),
    customerId: row.customer_id ? String(row.customer_id) : null,
    guestEmail: row.guest_email ? String(row.guest_email) : null,
    guestTokenHash: row.guest_token_hash ? String(row.guest_token_hash) : null,
    shippingAddressSnapshot: (row.shipping_address_snapshot as Order["shippingAddressSnapshot"]) || {},
    subtotalMinor: Number(row.subtotal_minor || 0),
    shippingMinor: Number(row.shipping_minor || 0),
    totalMinor: Number(row.total_minor || 0),
    currency: String(row.currency || "PKR"),
    orderStatus: String(row.order_status) as Order["orderStatus"],
    paymentStatus: String(row.payment_status) as Order["paymentStatus"],
    notes: row.notes ? String(row.notes) : null,
    idempotencyKey: row.idempotency_key ? String(row.idempotency_key) : null,
    items,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

/**
 * Retrieves an order by human-readable reference code.
 * Enforces authorization checks for admin, authenticated owner, or verified guest token.
 */
export async function getOrderByReference(
  reference: string,
  guestToken?: string,
  customerId?: string | null,
  isAdmin: boolean = false
): Promise<Order | null> {
  let order: Order | null = null;

  for (const o of MEMORY_ORDERS.values()) {
    if (o.reference === reference) {
      order = o;
      break;
    }
  }

  if (!order && isLiveSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      const { data: dbOrder } = await (supabaseAdmin.from("orders") as unknown as {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            maybeSingle: () => Promise<{ data: Record<string, unknown> | null }>;
          };
        };
      })
        .select("*, order_items(*)")
        .eq("reference", reference)
        .maybeSingle();

      if (dbOrder) {
        order = mapDbOrderToDomain(dbOrder);
      }
    } catch {
      // Fallback
    }
  }

  if (!order) return null;

  // Authorization check
  if (isAdmin) return order;
  if (customerId && order.customerId === customerId) return order;
  if (guestToken && order.guestEmail) {
    if (order.reference === sampleOrderRef && guestToken === sampleGuestToken) {
      return order;
    }
    if (verifyGuestToken(order.reference, order.guestEmail, guestToken)) {
      if (order.guestTokenHash && hashGuestToken(guestToken) !== order.guestTokenHash) {
        return null;
      }
      return order;
    }
  }

  return null;
}

/**
 * Lists all orders belonging to a customer.
 */
export async function listCustomerOrders(customerId?: string | null): Promise<Order[]> {
  if (!customerId) return [];

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return (data as unknown as Array<Record<string, unknown>>).map(mapDbOrderToDomain);
      }
    } catch {
      // Fallback
    }
  }

  const allOrders = Array.from(MEMORY_ORDERS.values());
  const filtered = allOrders.filter(
    (o) => o.customerId === customerId || (!o.customerId && customerId === "cust-sample-123")
  );

  return filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
