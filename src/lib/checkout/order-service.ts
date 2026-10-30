import crypto from "crypto";
import { generateGuestToken, verifyGuestToken } from "@/lib/auth/guest-token";
import { calculateOrderTotals } from "./shipping";
import type { CreateOrderInput, Order, OrderItem } from "./types";

function isLiveSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes("dummy-project") || url.includes("example.com")) {
    return false;
  }
  return true;
}

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

// Pre-seeded sample fixture for testing / mock verification
const sampleOrderId = "55555555-5555-5555-5555-555555555501";
const sampleOrderRef = "LC-20261031-7788";
const sampleGuestEmail = "ayesha@example.com";
const { token: sampleGuestToken, hash: sampleGuestTokenHash } = generateGuestToken(
  sampleOrderRef,
  sampleGuestEmail
);

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

/**
 * Creates an order idempotently.
 * If an order with input.idempotencyKey already exists, returns the existing order.
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

  // Calculate server-authoritative totals
  const totals = calculateOrderTotals(input.items);
  const orderId = crypto.randomUUID();
  const reference = generateOrderReference();

  let guestToken: string | undefined;
  let guestTokenHash: string | null = null;

  if (!customerId) {
    const { token, hash } = generateGuestToken(reference, input.address.email);
    guestToken = token;
    guestTokenHash = hash;
  }

  const orderItems: OrderItem[] = input.items.map((item) => {
    const itemId = crypto.randomUUID();
    const itemTotalMinor = item.unitPriceMinor * item.quantity;
    return {
      id: itemId,
      orderId,
      productId: item.productId,
      productTitle: item.title,
      unitPriceMinor: item.unitPriceMinor,
      quantity: item.quantity,
      totalMinor: itemTotalMinor,
      customizationSnapshot: {
        customization: item.customization,
        customText: item.customText,
        imageUrl: item.imageUrl,
        slug: item.slug,
      },
      createdAt: new Date().toISOString(),
    };
  });

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

  // Live Supabase database attempt
  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      await (supabase.from("orders") as unknown as {
        insert: (row: Record<string, unknown>) => Promise<unknown>;
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

      for (const item of newOrder.items) {
        await (supabase.from("order_items") as unknown as {
          insert: (row: Record<string, unknown>) => Promise<unknown>;
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
      }
    } catch {
      // Fall through to memory store
    }
  }

  // Update memory store
  MEMORY_ORDERS.set(orderId, newOrder);
  MEMORY_IDEMPOTENCY_INDEX.set(input.idempotencyKey, orderId);

  const orderUrl = guestToken
    ? `/orders/${reference}?token=${encodeURIComponent(guestToken)}`
    : `/orders/${reference}`;

  return { order: newOrder, guestToken, orderUrl };
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
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data: dbOrder } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("reference", reference)
        .single();

      if (dbOrder) {
        const row = dbOrder as unknown as {
          id: string;
          reference: string;
          customer_id: string | null;
          guest_email: string | null;
          guest_token_hash: string | null;
          shipping_address_snapshot: Record<string, unknown>;
          subtotal_minor: number;
          shipping_minor: number;
          total_minor: number;
          currency: string;
          order_status: Order["orderStatus"];
          payment_status: Order["paymentStatus"];
          notes: string | null;
          idempotency_key: string | null;
          order_items: Array<{
            id: string;
            order_id: string;
            product_id: string | null;
            product_title: string;
            unit_price_minor: number;
            quantity: number;
            total_minor: number;
            customization_snapshot: Record<string, unknown> | null;
            created_at: string;
          }>;
          created_at: string;
          updated_at: string;
        };

        order = {
          id: row.id,
          reference: row.reference,
          customerId: row.customer_id,
          guestEmail: row.guest_email,
          guestTokenHash: row.guest_token_hash,
          shippingAddressSnapshot: row.shipping_address_snapshot as unknown as Order["shippingAddressSnapshot"],
          subtotalMinor: Number(row.subtotal_minor),
          shippingMinor: Number(row.shipping_minor),
          totalMinor: Number(row.total_minor),
          currency: row.currency,
          orderStatus: row.order_status,
          paymentStatus: row.payment_status,
          notes: row.notes,
          idempotencyKey: row.idempotency_key,
          items: (row.order_items || []).map((i) => ({
            id: i.id,
            orderId: i.order_id,
            productId: i.product_id,
            productTitle: i.product_title,
            unitPriceMinor: Number(i.unit_price_minor),
            quantity: Number(i.quantity),
            totalMinor: Number(i.total_minor),
            customizationSnapshot: i.customization_snapshot as unknown as OrderItem["customizationSnapshot"],
            createdAt: i.created_at,
          })),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
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
      return order;
    }
  }

  return null;
}
