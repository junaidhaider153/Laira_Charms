"use server";

import { z } from "zod";
import { transitionOrderStatus } from "./order-admin-service";
import type { OrderStatus } from "./lifecycle";
import { isLiveSupabaseConfigured, allowOfflineFallback } from "@/lib/auth/offline-mode";

const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Order identifier is required"),
  targetStatus: z.enum([
    "pending_payment",
    "awaiting_verification",
    "confirmed",
    "in_production",
    "ready_to_ship",
    "shipped",
    "delivered",
    "on_hold",
    "cancelled",
    "refunded",
  ] as [string, ...string[]]),
  note: z.string().max(500).optional(),
  courierPartner: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
});

export async function updateOrderStatusAction(input: {
  orderId: string;
  targetStatus: OrderStatus;
  note?: string;
  courierPartner?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}) {
  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid input data.",
    };
  }

  // Admin authorization check
  let adminId = "admin-dev-fallback";
  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: "Unauthorized. Admin authentication required." };
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if ((profile as { role?: string } | null)?.role !== "admin") {
        return { success: false, message: "Forbidden. Admin privileges required." };
      }

      adminId = user.id;
    } catch {
      return { success: false, message: "Admin authorization check failed." };
    }
  } else if (!allowOfflineFallback()) {
    return { success: false, message: "Unauthorized. Admin authentication required." };
  }

  try {
    const trackingInfo =
      parsed.data.targetStatus === "shipped" && parsed.data.trackingNumber
        ? {
            courierPartner: parsed.data.courierPartner || "TCS",
            trackingNumber: parsed.data.trackingNumber,
            trackingUrl: parsed.data.trackingUrl,
          }
        : undefined;

    const result = await transitionOrderStatus(
      parsed.data.orderId,
      parsed.data.targetStatus as OrderStatus,
      adminId,
      "admin",
      parsed.data.note,
      trackingInfo
    );

    return {
      success: true,
      message: `Order status advanced to ${parsed.data.targetStatus}.`,
      order: result.order,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update order status.";
    return {
      success: false,
      message,
    };
  }
}

