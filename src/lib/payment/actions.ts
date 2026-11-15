"use server";

import { submitPaymentProofSchema, reviewPaymentSchema } from "./schemas";
import { submitPaymentProof, reviewPayment } from "./payment-service";
import type { ReviewPaymentInput } from "./types";
import { isLiveSupabaseConfigured, allowOfflineFallback } from "@/lib/auth/offline-mode";

export async function submitPaymentProofAction(
  _prevState: unknown,
  formData: FormData
) {
  const proofFile = formData.get("proofFile") as File | null;
  const hasFile = Boolean(
    proofFile &&
      typeof proofFile === "object" &&
      "size" in proofFile &&
      Number((proofFile as unknown as { size: number }).size) > 0
  );

  let rawProofPath = formData.get("proofPath")?.toString() || "";
  if (!rawProofPath && hasFile && proofFile) {
    const fileName = (proofFile as unknown as { name?: string }).name || "proof.png";
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    rawProofPath = `payment-proofs/${formData.get("orderReference") || "order"}/${Date.now()}_${safeName}`;
  }

  // File size & mime validation
  if (hasFile && proofFile) {
    const fileObj = proofFile as unknown as { size: number; type?: string };
    if (fileObj.size > 10 * 1024 * 1024) {
      return {
        success: false,
        message: "Payment proof file exceeds the 10 MB maximum limit.",
      };
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (fileObj.type && !allowed.includes(fileObj.type)) {
      return {
        success: false,
        message: "Invalid file format. Please upload JPG, PNG, WebP, or PDF.",
      };
    }
  }

  const rawInput = {
    orderReference: formData.get("orderReference")?.toString() || "",
    methodId: formData.get("methodId")?.toString() || "",
    senderName: formData.get("senderName")?.toString() || "",
    transactionId: formData.get("transactionId")?.toString() || "",
    proofPath: rawProofPath,
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

  if (hasFile && proofFile && isLiveSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      const buffer = Buffer.from(await (proofFile as unknown as { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer());
        const storagePath = parsed.data.proofPath.replace(/^payment-proofs\//, "");
        const { error: uploadError } = await supabaseAdmin.storage
          .from("payment-proofs")
          .upload(storagePath, buffer, {
            contentType: proofFile.type || "application/octet-stream",
            upsert: true,
          });

        if (uploadError) {
          console.error("Storage upload error for payment proof:", uploadError);
          if (!allowOfflineFallback()) {
            return {
              success: false,
              message: `Storage upload failed: ${uploadError.message}`,
            };
          }
        }
      } catch (uploadCatch: unknown) {
        if (!allowOfflineFallback()) {
          return {
            success: false,
            message: uploadCatch instanceof Error ? uploadCatch.message : "Proof upload error",
          };
        }
      }
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

export async function getPaymentProofSignedUrlAction(
  proofPath: string
): Promise<{ success: boolean; signedUrl?: string; message?: string }> {
  if (!proofPath || typeof proofPath !== "string") {
    return { success: false, message: "Invalid payment proof path." };
  }

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

      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      const storageKey = proofPath.replace(/^payment-proofs\//, "");
      const { data, error } = await supabaseAdmin.storage
        .from("payment-proofs")
        .createSignedUrl(storageKey, 3600);

      if (error || !data?.signedUrl) {
        return { success: false, message: error?.message || "Failed to create signed URL." };
      }

      return { success: true, signedUrl: data.signedUrl };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Error creating signed proof URL.",
      };
    }
  }

  return {
    success: true,
    signedUrl: proofPath.startsWith("http") ? proofPath : "/images/placeholder.jpg",
  };
}

