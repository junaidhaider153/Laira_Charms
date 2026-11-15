import type { OrderStatus } from "@/lib/supabase/types";

export type { OrderStatus };

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  "pending_payment",
  "awaiting_verification",
  "confirmed",
  "in_production",
  "ready_to_ship",
  "shipped",
  "delivered",
];

export const COURIER_PARTNERS = [
  "PostEx",
  "TCS",
] as const;

export type CourierPartner = (typeof COURIER_PARTNERS)[number];

export interface CourierTrackingDetails {
  courierPartner: CourierPartner | string;
  trackingNumber: string;
  trackingUrl?: string;
  dispatchedAt?: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  actorId: string | null;
  actorType: "admin" | "system" | "customer";
  note: string | null;
  createdAt: string;
}

/**
 * Valid state machine transitions for Laira Charms orders.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["awaiting_verification", "cancelled"],
  awaiting_verification: ["confirmed", "on_hold", "cancelled"],
  confirmed: ["in_production", "on_hold", "cancelled"],
  in_production: ["ready_to_ship", "on_hold"],
  ready_to_ship: ["shipped", "on_hold"],
  shipped: ["delivered", "on_hold"],
  delivered: [], // Terminal delivery state (replacements for transit damage handled via new order)
  on_hold: [
    "awaiting_verification",
    "confirmed",
    "in_production",
    "ready_to_ship",
    "shipped",
    "cancelled",
  ],
  cancelled: [], // Terminal
  refunded: [],  // Terminal
};

/**
 * Returns whether a transition from current to target status is valid.
 */
export function canTransitionOrderStatus(
  current: OrderStatus,
  target: OrderStatus
): boolean {
  if (current === target) return false;
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  return allowed.includes(target);
}

/**
 * Returns list of allowed next statuses for an order.
 */
export function getNextAllowedOrderStatuses(current: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[current] || [];
}

/**
 * Formats order status for customer and administrative display.
 */
export function formatOrderStatus(status: OrderStatus): {
  label: string;
  badgeClass: string;
  description: string;
} {
  switch (status) {
    case "pending_payment":
      return {
        label: "Awaiting Payment",
        badgeClass: "bg-surface-cloud text-espresso-muted border-border-warm",
        description: "Awaiting bank or wallet transfer proof submission from customer.",
      };
    case "awaiting_verification":
      return {
        label: "Verification Pending",
        badgeClass: "bg-peach-tint text-primary border-primary/30",
        description: "Payment proof submitted. Cross-referencing studio bank statement.",
      };
    case "confirmed":
      return {
        label: "Confirmed & Queued",
        badgeClass: "bg-secondary/15 text-secondary border-secondary/30",
        description: "Payment confirmed. Order queued for artisanal crafting.",
      };
    case "in_production":
      return {
        label: "In Production",
        badgeClass: "bg-primary/15 text-primary border-primary/30",
        description: "Handcrafted sculpting, oven-baking, and UV glaze curing in progress.",
      };
    case "ready_to_ship":
      return {
        label: "Ready to Ship",
        badgeClass: "bg-accent-gold/20 text-espresso-deep border-accent-gold/40",
        description: "Quality inspection passed. Packaged in keepsake tin with courier label.",
      };
    case "shipped":
      return {
        label: "Dispatched",
        badgeClass: "bg-secondary/20 text-secondary border-secondary/40",
        description: "Handed over to courier for nationwide delivery.",
      };
    case "delivered":
      return {
        label: "Delivered",
        badgeClass: "bg-secondary text-white border-transparent",
        description: "Delivered to customer address.",
      };
    case "on_hold":
      return {
        label: "On Hold",
        badgeClass: "bg-error/15 text-error border-error/30",
        description: "Order on hold pending customer clarification or payment re-submission.",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        badgeClass: "bg-surface-cloud text-espresso-muted border-border-warm",
        description: "Order cancelled.",
      };
    case "refunded":
      return {
        label: "Refunded",
        badgeClass: "bg-surface-cloud text-espresso-muted border-border-warm",
        description: "Funds returned to customer.",
      };
    default:
      return {
        label: status,
        badgeClass: "bg-surface-cloud text-espresso-muted",
        description: "",
      };
  }
}

