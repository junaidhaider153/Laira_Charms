"use server";

import { createCustomRequestSchema, quoteDecisionSchema } from "./schemas";
import { createCustomRequest, respondToQuotation } from "./custom-order-service";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { isHoneypotClean, verifyTurnstileToken } from "@/lib/security/spam-protection";
import { isLiveSupabaseConfigured } from "@/lib/auth/offline-mode";

export async function submitCustomRequestAction(
  _prevState: unknown,
  formData: FormData
) {
  // 1. Honeypot check
  const honeypot = formData.get("studio_inquiry_hp")?.toString();
  if (!isHoneypotClean(honeypot)) {
    return {
      success: false,
      message: "Spam submission detected.",
    };
  }

  // 2. IP Rate limit check: max 5 requests per 10 minutes
  const rateLimit = await checkRateLimit({
    keyPrefix: "custom_order_inquiry",
    limit: 5,
    windowSeconds: 600,
  });

  if (!rateLimit.success) {
    return {
      success: false,
      message: `Too many inquiries submitted from this connection. Please wait ${rateLimit.resetInSeconds} seconds before submitting again.`,
    };
  }

  // 3. Optional Turnstile challenge token verification
  const turnstileToken = formData.get("cf-turnstile-response")?.toString();
  const turnstileCheck = await verifyTurnstileToken(turnstileToken);
  if (!turnstileCheck.success) {
    return {
      success: false,
      message: turnstileCheck.error || "Bot verification challenge failed.",
    };
  }

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

    // Persist uploaded customer reference sketches/photos into storage
    const referenceFiles = formData.getAll("referenceFiles");
    if (referenceFiles.length > 0 && isLiveSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const supabaseAdmin = createAdminClient();
        for (const fileItem of referenceFiles) {
          if (
            fileItem &&
            typeof fileItem === "object" &&
            "arrayBuffer" in fileItem &&
            fileItem.size > 0 &&
            fileItem.size <= 15 * 1024 * 1024
          ) {
            const file = fileItem as File;
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const storagePath = `${request.id}/${Date.now()}_${safeName}`;
            const buffer = Buffer.from(await file.arrayBuffer());
            const { error: uploadError } = await supabaseAdmin.storage
              .from("custom-request-media")
              .upload(storagePath, buffer, {
                contentType: file.type || "application/octet-stream",
                upsert: true,
              });

            if (!uploadError) {
              await (supabaseAdmin.from("custom_request_media") as unknown as {
                insert: (row: Record<string, unknown>) => Promise<unknown>;
              }).insert({
                request_id: request.id,
                storage_path: storagePath,
                mime_type: file.type || "image/jpeg",
                size_bytes: file.size,
              });
            }
          }
        }
      } catch (uploadErr) {
        console.error("Failed to upload custom request reference media:", uploadErr);
      }
    }

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
