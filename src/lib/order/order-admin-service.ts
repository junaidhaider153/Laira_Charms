import crypto from "crypto";
import { MEMORY_ORDERS } from "@/lib/checkout/order-service";
import { MEMORY_PAYMENTS } from "@/lib/payment/payment-service";
import {
  canTransitionOrderStatus,
  type OrderStatus,
  type OrderStatusHistoryEntry,
  type CourierTrackingDetails,
} from "./lifecycle";
import type { Order } from "@/lib/checkout/types";
import type { PaymentRecord } from "@/lib/payment/types";

function isLiveSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes("dummy-project") || url.includes("example.com")) {
    return false;
  }
  return true;
}

export const MEMORY_ORDER_HISTORY: Map<string, OrderStatusHistoryEntry[]> = new Map();

// Seed sample order history
const sampleOrderId = "55555555-5555-5555-5555-555555555501";
MEMORY_ORDER_HISTORY.set(sampleOrderId, [
  {
    id: "history-sample-001",
    orderId: sampleOrderId,
    previousStatus: "pending_payment",
    newStatus: "pending_payment",
    actorId: null,
    actorType: "customer",
    note: "Order placed by customer via website checkout.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]);

/**
 * Transitions an order to a new status according to state machine rules.
 */
export async function transitionOrderStatus(
  orderIdOrRef: string,
  targetStatus: OrderStatus,
  actorId: string | null,
  actorType: "admin" | "system" | "customer",
  note?: string,
  trackingInfo?: CourierTrackingDetails
): Promise<{ order: Order; historyEntry: OrderStatusHistoryEntry }> {
  let order: Order | null = null;

  for (const o of MEMORY_ORDERS.values()) {
    if (o.id === orderIdOrRef || o.reference === orderIdOrRef) {
      order = o;
      break;
    }
  }

  if (!order && isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .or(`id.eq.${orderIdOrRef},reference.eq.${orderIdOrRef}`)
        .single();

      if (data) {
        // Hydrate from live supabase
        order = data as unknown as Order;
      }
    } catch {
      // Fallback
    }
  }

  if (!order) {
    throw new Error(`Order not found for identifier: ${orderIdOrRef}`);
  }

  // Validate state transition
  if (!canTransitionOrderStatus(order.orderStatus, targetStatus)) {
    throw new Error(
      `Illegal order transition: cannot advance order from "${order.orderStatus}" to "${targetStatus}".`
    );
  }

  // Validate courier tracking if advancing to shipped
  if (targetStatus === "shipped") {
    if (!trackingInfo || !trackingInfo.trackingNumber?.trim()) {
      throw new Error("A tracking number is required when marking an order as shipped.");
    }
  }

  const previousStatus = order.orderStatus;
  const now = new Date().toISOString();

  // Create history record
  const historyEntry: OrderStatusHistoryEntry = {
    id: crypto.randomUUID(),
    orderId: order.id,
    previousStatus,
    newStatus: targetStatus,
    actorId,
    actorType,
    note: note || (trackingInfo ? `Dispatched via ${trackingInfo.courierPartner} (CN: ${trackingInfo.trackingNumber})` : null),
    createdAt: now,
  };

  // Update order object
  order.orderStatus = targetStatus;
  order.updatedAt = now;

  if (trackingInfo) {
    const trackingNote = `Courier: ${trackingInfo.courierPartner} | CN: ${trackingInfo.trackingNumber}${
      trackingInfo.trackingUrl ? ` | URL: ${trackingInfo.trackingUrl}` : ""
    }`;
    order.notes = order.notes ? `${order.notes}\n${trackingNote}` : trackingNote;
  }

  // Update in-memory stores
  MEMORY_ORDERS.set(order.id, order);

  const existingHistory = MEMORY_ORDER_HISTORY.get(order.id) || [];
  MEMORY_ORDER_HISTORY.set(order.id, [...existingHistory, historyEntry]);

  // If live Supabase is configured, persist
  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();

      await (supabase.from("orders") as unknown as {
        update: (row: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<unknown> };
      })
        .update({
          order_status: order.orderStatus,
          notes: order.notes,
          updated_at: now,
        })
        .eq("id", order.id);

      await (supabase.from("order_status_history") as unknown as {
        insert: (row: Record<string, unknown>) => Promise<unknown>;
      }).insert({
        id: historyEntry.id,
        order_id: historyEntry.orderId,
        previous_status: historyEntry.previousStatus,
        new_status: historyEntry.newStatus,
        actor_id: historyEntry.actorId,
        actor_type: historyEntry.actorType,
        note: historyEntry.note,
        created_at: now,
      });

      await (supabase.from("audit_logs") as unknown as {
        insert: (row: Record<string, unknown>) => Promise<unknown>;
      }).insert({
        id: crypto.randomUUID(),
        actor_id: actorId,
        action: "order.status_transition",
        entity: "orders",
        entity_id: order.id,
        payload: {
          previousStatus,
          newStatus: targetStatus,
          trackingInfo,
        },
      });
    } catch {
      // Fallback
    }
  }

  return { order, historyEntry };
}

/**
 * Retrieves chronological status history for an order.
 */
export async function getOrderHistory(orderId: string): Promise<OrderStatusHistoryEntry[]> {
  const history = MEMORY_ORDER_HISTORY.get(orderId);
  if (history && history.length > 0) {
    return [...history].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase
        .from("order_status_history")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (data) {
        return (data as unknown as OrderStatusHistoryEntry[]);
      }
    } catch {
      // Fallback
    }
  }

  return [];
}

/**
 * Retrieves all orders with queue counts for the admin dashboard.
 */
export async function listAdminOrders(filter?: {
  status?: OrderStatus | "all";
  query?: string;
}): Promise<{ orders: Order[]; counts: Record<string, number> }> {
  let allOrders: Order[] = Array.from(MEMORY_ORDERS.values());

  if (allOrders.length === 0 && isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });

      if (data) {
        allOrders = data as unknown as Order[];
      }
    } catch {
      // Fallback
    }
  }

  // Calculate queue counts across all statuses
  const counts: Record<string, number> = {
    all: allOrders.length,
    awaiting_verification: 0,
    confirmed: 0,
    in_production: 0,
    ready_to_ship: 0,
    shipped: 0,
    delivered: 0,
    on_hold: 0,
    pending_payment: 0,
  };

  allOrders.forEach((o) => {
    if (counts[o.orderStatus] !== undefined) {
      counts[o.orderStatus]++;
    }
  });

  // Apply filters
  let filtered = [...allOrders];

  if (filter?.status && filter.status !== "all") {
    filtered = filtered.filter((o) => o.orderStatus === filter.status);
  }

  if (filter?.query && filter.query.trim()) {
    const q = filter.query.toLowerCase().trim();
    filtered = filtered.filter(
      (o) =>
        o.reference.toLowerCase().includes(q) ||
        o.shippingAddressSnapshot.fullName.toLowerCase().includes(q) ||
        o.shippingAddressSnapshot.phone.includes(q) ||
        o.shippingAddressSnapshot.city.toLowerCase().includes(q)
    );
  }

  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { orders: filtered, counts };
}

/**
 * Retrieves single order details, history, and payment record for admin inspection.
 */
export async function getAdminOrderById(orderIdOrRef: string): Promise<{
  order: Order;
  history: OrderStatusHistoryEntry[];
  payment: PaymentRecord | null;
} | null> {
  let order: Order | null = null;

  for (const o of MEMORY_ORDERS.values()) {
    if (o.id === orderIdOrRef || o.reference === orderIdOrRef) {
      order = o;
      break;
    }
  }

  if (!order) return null;

  const history = await getOrderHistory(order.id);

  let payment: PaymentRecord | null = null;
  for (const p of MEMORY_PAYMENTS.values()) {
    if (p.orderId === order.id || p.orderReference === order.reference) {
      payment = p;
      break;
    }
  }

  return { order, history, payment };
}

