"use server";

import { createCustomRequestSchema, quoteDecisionSchema } from "./schemas";
import { createCustomRequest, respondToQuotation } from "./custom-order-service";

export async function submitCustomRequestAction(
  _prevState: unknown,
  formData: FormData
) {
  const rawData = {
    title: formData.get("title")?.toString() || "",
    brief: formData.get("brief")?.toString() || "",
    desiredDeliveryDate: formData.get("desiredDeliveryDate")?.toString() || undefined,
    customerName: formData.get("customerName")?.toString() || "",
    customerEmail: formData.get("customerEmail")?.toString() || "",
    customerPhone: formData.get("customerPhone")?.toString() || "",
    productReferenceId: formData.get("productReferenceId")?.toString() || undefined,
  };

  const parsed = createCustomRequestSchema.safeParse(rawData);
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
      message: "Please correct the highlighted fields in your inquiry.",
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
    // Unauthenticated guest inquiry
  }

  try {
    const { request, guestToken, trackingUrl } = await createCustomRequest(
      parsed.data,
      customerId
    );

    return {
      success: true,
      requestId: request.id,
      guestToken,
      trackingUrl,
      message: "Your bespoke inquiry has been received! Our studio will review it within 24 hours.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit custom inquiry. Please try again.";
    return {
      success: false,
      message,
    };
  }
}

export async function respondToQuotationAction(input: {
  quotationId: string;
  action: "accept" | "decline";
  declineReason?: string;
  guestToken?: string;
}) {
  const parsed = quoteDecisionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid quotation request.",
    };
  }

  let customerId: string | null = null;
  let isAdmin = false;
  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      customerId = user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = (profile as { role?: string } | null)?.role === "admin";
    }
  } catch {
    // Guest or unauthenticated
  }

  try {
    const result = await respondToQuotation(parsed.data, customerId, isAdmin);
    return {
      success: true,
      quotation: result.quotation,
      message: result.message,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process quotation response.";
    return {
      success: false,
      message,
    };
  }
}
