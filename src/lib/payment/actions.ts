"use server";

import { submitPaymentProofSchema, reviewPaymentSchema } from "./schemas";
import { submitPaymentProof, reviewPayment } from "./payment-service";
import type { ReviewPaymentInput } from "./types";
import { isLiveSupabaseConfigured, allowOfflineFallback } from "@/lib/auth/offline-mode";

export async function submitPaymentProofAction(
  _prevState: unknown,
  formData: FormData
) {
  const rawInput = {
    orderReference: formData.get("orderReference")?.toString() || "",
    methodId: formData.get("methodId")?.toString() || "",
    senderName: formData.get("senderName")?.toString() || "",
    transactionId: formData.get("transactionId")?.toString() || "",
    proofPath: formData.get("proofPath")?.toString() || "",
    guestToken: formData.get("guestToken")?.toString() || undefined,
  };

  const parsed = submitPaymentProofSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMap: Record<string, string> = {};
    parsed.error.errors.forEach((err) => {
      const field = err.path[0]?.toString();
      if (field) {
        errorMap[field] = err.message;
      }
    });

    return {
      success: false,
      errors: errorMap,
      message: "Please complete all required payment verification fields.",
    };
  }

  // Attempt resolving user session if signed in
  let customerId: string | null = null;
  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      customerId = user.id;
    }
  } catch {
    // Guest or unauthenticated
  }

  try {
    const result = await submitPaymentProof(parsed.data, customerId);
    return {
      success: true,
      message: result.message,
      payment: result.payment,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit payment proof.";
    return {
      success: false,
      message,
    };
  }
}

export async function adminReviewPaymentAction(rawInput: ReviewPaymentInput) {
  const parsed = reviewPaymentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid review input.",
    };
  }

  let adminUserId = "admin-dev-fallback";
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

      adminUserId = user.id;
    } catch {
      return { success: false, message: "Admin authorization check failed." };
    }
  } else if (!allowOfflineFallback()) {
    return { success: false, message: "Unauthorized. Admin authentication required." };
  }

  try {
    const result = await reviewPayment(parsed.data, adminUserId);
    return {
      success: true,
      message: result.message,
      payment: result.payment,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process review action.";
    return {
      success: false,
      message,
    };
  }
}

