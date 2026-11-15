import crypto from "crypto";
import { getOrderByReference, MEMORY_ORDERS, mapDbOrderToDomain } from "@/lib/checkout/order-service";
import { PAKISTANI_PAYMENT_ACCOUNTS } from "./bank-details";
import { enqueueNotification } from "@/lib/notifications/outbox-service";
import type {
  PaymentRecord,
  SubmitPaymentProofInput,
  ReviewPaymentInput,
  PaymentMethodDetails,
} from "./types";
import type { Order } from "@/lib/checkout/types";
import { isLiveSupabaseConfigured, allowOfflineFallback } from "@/lib/auth/offline-mode";

export const MEMORY_PAYMENTS: Map<string, PaymentRecord> = new Map();

// Pre-seeded initial sample fixture for testing & E2E flows only in non-production
const samplePaymentId = "77777777-7777-7777-7777-777777777701";
const sampleOrderId = "55555555-5555-5555-5555-555555555501";
const sampleOrderRef = "LC-20261031-7788";

if (process.env.NODE_ENV !== "production") {
  const samplePayment: PaymentRecord = {
    id: samplePaymentId,
    orderId: sampleOrderId,
    orderReference: sampleOrderRef,
    amountMinor: 265000, // Rs. 2,650
    currency: "PKR",
    status: "awaiting_payment",
    paymentMethodSnapshot: null,
    proofStoragePath: null,
    proofSubmittedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MEMORY_PAYMENTS.set(samplePaymentId, samplePayment);
}

/**
 * Retrieves payment and order details with authorization enforcement.
 */
export async function getPaymentByOrderReference(
  orderReference: string,
  guestToken?: string,
  customerId?: string | null,
  isAdmin: boolean = false
): Promise<{ order: Order; payment: PaymentRecord } | null> {
  const order = await getOrderByReference(orderReference, guestToken, customerId, isAdmin);
  if (!order) return null;

  let payment: PaymentRecord | null = null;
  for (const p of MEMORY_PAYMENTS.values()) {
    if (p.orderId === order.id || p.orderReference === orderReference) {
      payment = p;
      break;
    }
  }

  if (!payment && isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const row = data as unknown as {
          id: string;
          order_id: string;
          amount_minor: number;
          currency: string;
          status: PaymentRecord["status"];
          payment_method_snapshot: Record<string, unknown> | null;
          proof_storage_path: string | null;
          proof_submitted_at: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };

        payment = {
          id: row.id,
          orderId: row.order_id,
          orderReference: order.reference,
          amountMinor: Number(row.amount_minor),
          currency: row.currency,
          status: row.status,
          paymentMethodSnapshot: row.payment_method_snapshot as unknown as PaymentRecord["paymentMethodSnapshot"],
          proofStoragePath: row.proof_storage_path,
          proofSubmittedAt: row.proof_submitted_at,
          reviewedBy: row.reviewed_by,
          reviewedAt: row.reviewed_at,
          rejectionReason: row.rejection_reason,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
    } catch {
      // Fall through to memory creation
    }
  }

  // If no payment record exists yet for this order, create an initial awaiting_payment record
  if (!payment) {
    payment = {
      id: crypto.randomUUID(),
      orderId: order.id,
      orderReference: order.reference,
      amountMinor: order.totalMinor,
      currency: order.currency,
      status: order.paymentStatus || "awaiting_payment",
      paymentMethodSnapshot: null,
      proofStoragePath: null,
      proofSubmittedAt: null,
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MEMORY_PAYMENTS.set(payment.id, payment);
  }

  return { order, payment };
}

/**
 * Customer submits manual bank/wallet transfer screenshot proof.
 * Mandatory invariant: Proof upload NEVER marks payment as verified automatically!
 * Transitions payment status to 'verification_pending'.
 */
export async function submitPaymentProof(
  input: SubmitPaymentProofInput,
  customerId?: string | null
): Promise<{ order: Order; payment: PaymentRecord; message: string }> {
  const result = await getPaymentByOrderReference(
    input.orderReference,
    input.guestToken,
    customerId,
    false
  );

  if (!result) {
    throw new Error("Order not found or you are not authorized to submit payment proof for this order.");
  }

  const { order, payment } = result;

  if (payment.status === "verified") {
    throw new Error("Payment for this order has already been verified by our studio.");
  }

  // H-01: Protect order state. Do not allow proof submission on cancelled or terminal orders
  if (["cancelled", "delivered"].includes(order.orderStatus)) {
    throw new Error(`Cannot submit payment proof for an order with status "${order.orderStatus}".`);
  }

  const accountInfo = PAKISTANI_PAYMENT_ACCOUNTS.find((a) => a.id === input.methodId);
  const paymentMethodSnapshot: PaymentMethodDetails = {
    methodId: input.methodId,
    methodName: accountInfo?.name || input.methodId,
    senderName: input.senderName,
    transactionId: input.transactionId,
    accountTitle: accountInfo?.accountTitle || "Laira Charms",
    accountNumber: accountInfo?.accountNumber || "",
  };

  const now = new Date().toISOString();

  // Update payment record
  payment.status = "verification_pending";
  payment.paymentMethodSnapshot = paymentMethodSnapshot;
  payment.proofStoragePath = input.proofPath;
  payment.proofSubmittedAt = now;
  payment.updatedAt = now;

  // H-01: Only update order status to awaiting_verification if currently pending or on hold
  if (["pending_payment", "on_hold"].includes(order.orderStatus)) {
    order.orderStatus = "awaiting_verification";
  }
  order.paymentStatus = "verification_pending";
  order.updatedAt = now;

  MEMORY_PAYMENTS.set(payment.id, payment);
  MEMORY_ORDERS.set(order.id, order);

  // Live Supabase persist using admin client
  if (isLiveSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();

      const { error: payError } = await (supabaseAdmin.from("payments") as unknown as {
        upsert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
      }).upsert({
        id: payment.id,
        order_id: payment.orderId,
        amount_minor: payment.amountMinor,
        currency: payment.currency,
        status: payment.status,
        payment_method_snapshot: payment.paymentMethodSnapshot as unknown as Record<string, unknown>,
        proof_storage_path: payment.proofStoragePath,
        proof_submitted_at: payment.proofSubmittedAt,
        reviewed_by: payment.reviewedBy,
        reviewed_at: payment.reviewedAt,
        rejection_reason: payment.rejectionReason,
        updated_at: payment.updatedAt,
      });

      if (payError && !allowOfflineFallback()) {
        throw new Error(`Payment proof DB update failed: ${payError.message}`);
      }

      const { error: orderError } = await (supabaseAdmin.from("orders") as unknown as {
        update: (row: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> };
      })
        .update({
          payment_status: order.paymentStatus,
          order_status: order.orderStatus,
          updated_at: now,
        })
        .eq("id", order.id);

      if (orderError && !allowOfflineFallback()) {
        throw new Error(`Order payment status update failed: ${orderError.message}`);
      }
    } catch (err: unknown) {
      if (!allowOfflineFallback()) {
        throw err;
      }
    }
  }

  // Safely enqueue proof received notification (FR-017)
  try {
    const recipientEmail = order.shippingAddressSnapshot.email || order.guestEmail || "customer@example.pk";
    await enqueueNotification({
      recipientEmail,
      recipientName: order.shippingAddressSnapshot.fullName,
      eventType: "proof_received",
      idempotencyKey: `proof_received_${order.reference}_${payment.proofSubmittedAt || Date.now()}`,
      data: {
        orderReference: order.reference,
      },
    });
  } catch {
    // Invariant: Notification failure never corrupts payment submission
  }

  return {
    order,
    payment,
    message: "Payment proof submitted successfully! Our studio will verify your transfer shortly.",
  };
}

/**
 * Admin approves or rejects manual bank transfer with audit logging.
 */
export async function reviewPayment(
  input: ReviewPaymentInput,
  adminUserId: string
): Promise<{ order: Order; payment: PaymentRecord; message: string }> {
  let payment: PaymentRecord | null = MEMORY_PAYMENTS.get(input.paymentId) || null;

  if (!payment) {
    for (const p of MEMORY_PAYMENTS.values()) {
      if (p.id === input.paymentId) {
        payment = p;
        break;
      }
    }
  }

  // Live Supabase lookup if not found in memory
  if (!payment && isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("id", input.paymentId)
        .maybeSingle();

      if (!error && data) {
        const row = data as unknown as {
          id: string;
          order_id: string;
          amount_minor: number;
          currency: string;
          status: PaymentRecord["status"];
          payment_method_snapshot: Record<string, unknown> | null;
          proof_storage_path: string | null;
          proof_submitted_at: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };

        payment = {
          id: row.id,
          orderId: row.order_id,
          orderReference: "",
          amountMinor: Number(row.amount_minor),
          currency: row.currency,
          status: row.status,
          paymentMethodSnapshot: row.payment_method_snapshot as unknown as PaymentRecord["paymentMethodSnapshot"],
          proofStoragePath: row.proof_storage_path,
          proofSubmittedAt: row.proof_submitted_at,
          reviewedBy: row.reviewed_by,
          reviewedAt: row.reviewed_at,
          rejectionReason: row.rejection_reason,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
    } catch {
      // Fallback
    }
  }

  if (!payment) {
    throw new Error("Payment record not found.");
  }

  let order: Order | null = MEMORY_ORDERS.get(payment.orderId) || null;

  if (!order && isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", payment.orderId)
        .maybeSingle();

      if (!error && data) {
        order = mapDbOrderToDomain(data as unknown as Record<string, unknown>);
      }
    } catch {
      // Fallback
    }
  }

  if (!order) {
    throw new Error("Associated order not found.");
  }

  const now = new Date().toISOString();

  if (input.action === "verify") {
    payment.status = "verified";
    payment.reviewedBy = adminUserId;
    payment.reviewedAt = now;
    payment.rejectionReason = null;
    payment.updatedAt = now;

    order.paymentStatus = "verified";
    // H-01: Only transition orderStatus to confirmed if currently pending/awaiting/on_hold.
    // Never revert already in_production, ready_to_ship, shipped, or delivered orders to confirmed!
    if (["pending_payment", "awaiting_verification", "on_hold"].includes(order.orderStatus)) {
      order.orderStatus = "confirmed";
    }
    order.updatedAt = now;
  } else {
    if (!input.rejectionReason || input.rejectionReason.trim().length < 5) {
      throw new Error("A specific rejection reason of at least 5 characters is required.");
    }

    payment.status = "rejected";
    payment.rejectionReason = input.rejectionReason.trim();
    payment.reviewedBy = adminUserId;
    payment.reviewedAt = now;
    payment.updatedAt = now;

    order.paymentStatus = "rejected";
    if (!["cancelled", "delivered"].includes(order.orderStatus)) {
      order.orderStatus = "on_hold";
    }
    order.updatedAt = now;
  }

  MEMORY_PAYMENTS.set(payment.id, payment);
  MEMORY_ORDERS.set(order.id, order);

  // Live Supabase update & Audit logging using admin client
  if (isLiveSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();

      const { error: payUpdateErr } = await (supabaseAdmin.from("payments") as unknown as {
        update: (row: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> };
      })
        .update({
          status: payment.status,
          reviewed_by: payment.reviewedBy,
          reviewed_at: payment.reviewedAt,
          rejection_reason: payment.rejectionReason,
          updated_at: now,
        })
        .eq("id", payment.id);

      if (payUpdateErr && !allowOfflineFallback()) {
        throw new Error(`Payment review update failed: ${payUpdateErr.message}`);
      }

      const { error: orderUpdateErr } = await (supabaseAdmin.from("orders") as unknown as {
        update: (row: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> };
      })
        .update({
          payment_status: order.paymentStatus,
          order_status: order.orderStatus,
          updated_at: now,
        })
        .eq("id", order.id);

      if (orderUpdateErr && !allowOfflineFallback()) {
        throw new Error(`Order status review update failed: ${orderUpdateErr.message}`);
      }

      await (supabaseAdmin.from("audit_logs") as unknown as {
        insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
      }).insert({
        id: crypto.randomUUID(),
        actor_id: adminUserId,
        action: input.action === "verify" ? "payment.verified" : "payment.rejected",
        entity: "payments",
        entity_id: payment.id,
        payload: {
          orderReference: order.reference,
          action: input.action,
          rejectionReason: payment.rejectionReason,
        },
      });
    } catch (err: unknown) {
      if (!allowOfflineFallback()) {
        throw err;
      }
    }
  }

  // Safely enqueue review notification (FR-017)
  try {
    const recipientEmail = order.shippingAddressSnapshot.email || order.guestEmail || "customer@example.pk";
    const recipientName = order.shippingAddressSnapshot.fullName;

    if (input.action === "verify") {
      await enqueueNotification({
        recipientEmail,
        recipientName,
        eventType: "payment_verified",
        idempotencyKey: `payment_verified_${order.reference}`,
        data: {
          orderReference: order.reference,
        },
      });
    } else {
      await enqueueNotification({
        recipientEmail,
        recipientName,
        eventType: "proof_rejected",
        idempotencyKey: `proof_rejected_${order.reference}_${Date.now()}`,
        data: {
          orderReference: order.reference,
          reason: input.rejectionReason,
        },
      });
    }
  } catch {
    // Invariant: Notification failure never corrupts review
  }

  return {
    order,
    payment,
    message: input.action === "verify" ? "Payment verified successfully." : "Payment rejected and order placed on hold.",
  };
}
