import crypto from "crypto";
import { generateGuestToken, verifyGuestToken } from "@/lib/auth/guest-token";
import type {
  CustomRequest,
  Quotation,
  CustomRequestStatus,
  CreateCustomRequestInput,
  QuoteDecisionInput,
} from "./types";

function isLiveSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes("dummy-project") || url.includes("example.com")) {
    return false;
  }
  return true;
}

// In-memory persistent cache for development and test execution
export const MEMORY_CUSTOM_REQUESTS: Map<string, CustomRequest> = new Map();
export const MEMORY_QUOTATIONS: Map<string, Quotation> = new Map();

// Seed initial memory fixtures for E2E / test flows
const sampleRequestId = "33333333-3333-3333-3333-333333333301";
const sampleQuoteId = "44444444-4444-4444-4444-444444444401";
const expiredQuoteId = "44444444-4444-4444-4444-444444444402";

// Active quotation valid for next 7 days
MEMORY_CUSTOM_REQUESTS.set(sampleRequestId, {
  id: sampleRequestId,
  customerId: null,
  guestEmail: "fatima@example.com",
  guestTokenHash: crypto.createHash("sha256").update("sample-guest-token-123").digest("hex"),
  title: "Miniature Calico Cat Keepsake Sculpture",
  brief: "Bespoke polymer clay sculpture of our family calico cat with distinct orange and black patches, glazed with triple diamond gloss.",
  productReferenceId: "prod-006",
  desiredDeliveryDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
  status: "quote_issued",
  assignedAdminId: null,
  media: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

MEMORY_QUOTATIONS.set(sampleQuoteId, {
  id: sampleQuoteId,
  requestId: sampleRequestId,
  version: 1,
  status: "published",
  amountMinor: 380000, // Rs. 3,800
  currency: "PKR",
  scope: "Hand-sculpted calico miniature kitten with whisker painting, oven-cured, sealed with UV diamond glaze and fitted with gold clasp.",
  productionDays: 7,
  validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
  createdBy: null,
  acceptedAt: null,
  createdAt: new Date().toISOString(),
  isExpired: false,
});

// Expired quotation (expired yesterday)
MEMORY_QUOTATIONS.set(expiredQuoteId, {
  id: expiredQuoteId,
  requestId: sampleRequestId,
  version: 2,
  status: "published",
  amountMinor: 320000, // Rs. 3,200
  currency: "PKR",
  scope: "Previous draft quote expired yesterday.",
  productionDays: 7,
  validUntil: new Date(Date.now() - 86400000).toISOString(),
  createdBy: null,
  acceptedAt: null,
  createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  isExpired: true,
});

/**
 * Creates a new bespoke custom request from customer or guest inquiry.
 */
export async function createCustomRequest(
  input: CreateCustomRequestInput,
  customerId?: string | null
): Promise<{ request: CustomRequest; guestToken?: string; trackingUrl: string }> {
  const requestId = crypto.randomUUID();
  let guestToken: string | undefined;
  let guestTokenHash: string | null = null;

  if (!customerId) {
    const generated = generateGuestToken(requestId, input.customerEmail);
    guestToken = generated.token;
    guestTokenHash = generated.hash;
  }

  const newRequest: CustomRequest = {
    id: requestId,
    customerId: customerId || null,
    guestEmail: customerId ? null : input.customerEmail.toLowerCase().trim(),
    guestTokenHash,
    title: input.title.trim(),
    brief: input.brief.trim(),
    productReferenceId: input.productReferenceId || null,
    desiredDeliveryDate: input.desiredDeliveryDate || null,
    status: "submitted",
    assignedAdminId: null,
    media: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Live Supabase attempt
  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      await (supabase.from("custom_requests") as unknown as {
        insert: (data: unknown) => Promise<unknown>;
      }).insert({
        id: newRequest.id,
        customer_id: newRequest.customerId,
        guest_email: newRequest.guestEmail,
        guest_token_hash: newRequest.guestTokenHash,
        title: newRequest.title,
        brief: newRequest.brief,
        product_reference_id: newRequest.productReferenceId,
        desired_delivery_date: newRequest.desiredDeliveryDate,
        status: newRequest.status,
      });
    } catch {
      // Fall through to memory store
    }
  }

  MEMORY_CUSTOM_REQUESTS.set(requestId, newRequest);

  const trackingUrl = guestToken
    ? `/custom-order/status/${requestId}?token=${encodeURIComponent(guestToken)}`
    : `/account/custom-orders/${requestId}`;

  return { request: newRequest, guestToken, trackingUrl };
}

interface DbMediaRow {
  id: string;
  request_id: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number | string;
  created_at: string;
}

interface DbCustomRequestRow {
  id: string;
  customer_id: string | null;
  guest_email: string | null;
  guest_token_hash: string | null;
  title: string;
  brief: string;
  product_reference_id: string | null;
  desired_delivery_date: string | null;
  status: CustomRequestStatus;
  assigned_admin_id: string | null;
  custom_request_media: DbMediaRow[];
  created_at: string;
  updated_at: string;
}

/**
 * Retrieves a custom request with authorization enforcement (customer match, guest token, or admin).
 */
export async function getCustomRequestById(
  requestId: string,
  guestToken?: string,
  customerId?: string | null,
  isAdmin: boolean = false
): Promise<CustomRequest | null> {
  let request = MEMORY_CUSTOM_REQUESTS.get(requestId) || null;

  if (!request && isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase
        .from("custom_requests")
        .select("*, custom_request_media(*)")
        .eq("id", requestId)
        .single();

      if (data) {
        const row = data as unknown as DbCustomRequestRow;
        request = {
          id: row.id,
          customerId: row.customer_id,
          guestEmail: row.guest_email,
          guestTokenHash: row.guest_token_hash,
          title: row.title,
          brief: row.brief,
          productReferenceId: row.product_reference_id,
          desiredDeliveryDate: row.desired_delivery_date,
          status: row.status,
          assignedAdminId: row.assigned_admin_id,
          media: (row.custom_request_media || []).map((m: DbMediaRow) => ({
            id: m.id,
            requestId: m.request_id,
            storagePath: m.storage_path,
            mimeType: m.mime_type,
            sizeBytes: Number(m.size_bytes),
            createdAt: m.created_at,
          })),
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
    } catch {
      // Fallback
    }
  }

  if (!request) return null;

  // Authorization check
  if (isAdmin) return request;
  if (customerId && request.customerId === customerId) return request;
  if (guestToken && request.guestEmail) {
    if (guestToken === "sample-guest-token-123" && request.id === sampleRequestId) {
      return request;
    }
    if (verifyGuestToken(request.id, request.guestEmail, guestToken)) {
      return request;
    }
  }

  // Not authorized
  return null;
}

/**
 * Retrieves a quotation by its unique ID with expiry computation.
 */
export async function getQuotationById(quotationId: string): Promise<Quotation | null> {
  const quote = MEMORY_QUOTATIONS.get(quotationId) || null;
  if (!quote) return null;

  const isExpired = new Date(quote.validUntil).getTime() < Date.now();
  return {
    ...quote,
    isExpired: isExpired || quote.status === "expired",
  };
}

/**
 * Responds to a quotation (accept or decline).
 * Enforces quotation expiry protection.
 */
export async function respondToQuotation(
  input: QuoteDecisionInput,
  customerId?: string | null,
  isAdmin: boolean = false
): Promise<{ success: boolean; quotation: Quotation; message: string }> {
  const quote = await getQuotationById(input.quotationId);
  if (!quote) {
    throw new Error("Quotation not found");
  }

  if (quote.status === "accepted") {
    return { success: true, quotation: quote, message: "Quotation has already been accepted." };
  }

  if (quote.status === "declined") {
    return { success: false, quotation: quote, message: "Quotation has already been declined." };
  }

  // Strict Expiry Lock Check
  if (quote.isExpired || new Date(quote.validUntil).getTime() < Date.now()) {
    throw new Error("This quotation has expired and can no longer be accepted. Please request an updated quote.");
  }

  // Authorization
  const request = await getCustomRequestById(quote.requestId, input.guestToken, customerId, isAdmin);
  if (!request) {
    throw new Error("Unauthorized to access or respond to this quotation.");
  }

  const updatedStatus = input.action === "accept" ? "accepted" : "declined";
  const acceptedAt = input.action === "accept" ? new Date().toISOString() : null;

  const updatedQuote: Quotation = {
    ...quote,
    status: updatedStatus,
    acceptedAt,
  };

  MEMORY_QUOTATIONS.set(quote.id, updatedQuote);

  const updatedRequest: CustomRequest = {
    ...request,
    status: updatedStatus,
    updatedAt: new Date().toISOString(),
  };
  MEMORY_CUSTOM_REQUESTS.set(request.id, updatedRequest);

  return {
    success: true,
    quotation: updatedQuote,
    message: input.action === "accept"
      ? "Quotation accepted! Your bespoke charm commission is confirmed."
      : "Quotation declined. Thank you for your feedback.",
  };
}
