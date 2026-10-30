"use server";

import { createOrderSchema } from "./schemas";
import { createOrder } from "./order-service";
import type { CreateOrderInput } from "./types";

export async function createOrderAction(rawInput: CreateOrderInput) {
  const parsed = createOrderSchema.safeParse(rawInput);

  if (!parsed.success) {
    const errorMap: Record<string, string> = {};
    parsed.error.errors.forEach((err) => {
      const field = err.path.join(".");
      if (field) {
        errorMap[field] = err.message;
      }
    });

    return {
      success: false,
      errors: errorMap,
      message: "Please complete all required shipping details correctly.",
    };
  }

  // Attempt resolving authenticated customer session if signed in
  let customerId: string | null = null;
  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      customerId = user.id;
    }
  } catch {
    // Unauthenticated guest checkout
  }

  try {
    const { order, guestToken, orderUrl } = await createOrder(
      parsed.data,
      customerId
    );

    return {
      success: true,
      orderReference: order.reference,
      orderId: order.id,
      guestToken,
      orderUrl,
      message: "Your order has been placed successfully! Please review payment instructions.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to place order. Please try again.";
    return {
      success: false,
      message,
    };
  }
}
