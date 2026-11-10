"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/utils";
import {
  formatOrderStatus,
  getNextAllowedOrderStatuses,
  COURIER_PARTNERS,
  type OrderStatus,
  type OrderStatusHistoryEntry,
} from "@/lib/order/lifecycle";
import type { Order } from "@/lib/checkout/types";
import type { PaymentRecord } from "@/lib/payment/types";
import { updateOrderStatusAction } from "@/lib/order/actions";
import { adminReviewPaymentAction } from "@/lib/payment/actions";

interface AdminOrderDetailViewProps {
  order: Order;
  history: OrderStatusHistoryEntry[];
  payment: PaymentRecord | null;
}

export function AdminOrderDetailView({
  order: initialOrder,
  history: initialHistory,
  payment: initialPayment,
}: AdminOrderDetailViewProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [history, setHistory] = useState<OrderStatusHistoryEntry[]>(initialHistory);
  const [payment, setPayment] = useState<PaymentRecord | null>(initialPayment);

  // Status transition form state
  const allowedNextStatuses = getNextAllowedOrderStatuses(order.orderStatus);
  const [targetStatus, setTargetStatus] = useState<OrderStatus>(
    allowedNextStatuses[0] || order.orderStatus
  );
  const [courierPartner, setCourierPartner] = useState<string>("TCS");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Payment review modal / quick action state
  const [isReviewingPayment, setIsReviewingPayment] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const handleStatusTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    setStatusFeedback(null);

    try {
      const result = await updateOrderStatusAction({
        orderId: order.id,
        targetStatus,
        note: statusNote || undefined,
        courierPartner: targetStatus === "shipped" ? courierPartner : undefined,
        trackingNumber: targetStatus === "shipped" ? trackingNumber : undefined,
        trackingUrl: targetStatus === "shipped" ? trackingUrl : undefined,
      });

      if (!result.success) {
        setStatusFeedback({ type: "error", message: result.message });
        setIsUpdatingStatus(false);
        return;
      }

      setStatusFeedback({ type: "success", message: result.message });
      if (result.order) {
        setOrder(result.order);
      }
      // Add local history entry
      setHistory((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          orderId: order.id,
          previousStatus: order.orderStatus,
          newStatus: targetStatus,
          actorId: "admin",
          actorType: "admin",
          note: statusNote || (targetStatus === "shipped" ? `Dispatched via ${courierPartner} (CN: ${trackingNumber})` : null),
          createdAt: new Date().toISOString(),
        },
      ]);
      setStatusNote("");
      setIsUpdatingStatus(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update order status.";
      setStatusFeedback({ type: "error", message: msg });
      setIsUpdatingStatus(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!payment) return;
    setIsReviewingPayment(true);
    setStatusFeedback(null);

    try {
      const result = await adminReviewPaymentAction({
        paymentId: payment.id,
        action: "verify",
      });

      if (!result.success) {
        setStatusFeedback({ type: "error", message: result.message });
        setIsReviewingPayment(false);
        return;
      }

      setStatusFeedback({ type: "success", message: result.message });
      setPayment((prev) => (prev ? { ...prev, status: "verified" } : null));
      setOrder((prev) => ({
        ...prev,
        paymentStatus: "verified",
        orderStatus: "confirmed",
      }));
      setIsReviewingPayment(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to verify payment.";
      setStatusFeedback({ type: "error", message: msg });
      setIsReviewingPayment(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!payment) return;
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      setStatusFeedback({
        type: "error",
        message: "A specific rejection reason of at least 5 characters is required.",
      });
      return;
    }

    setIsReviewingPayment(true);
    setStatusFeedback(null);

    try {
      const result = await adminReviewPaymentAction({
        paymentId: payment.id,
        action: "reject",
        rejectionReason: rejectReason.trim(),
      });

      if (!result.success) {
        setStatusFeedback({ type: "error", message: result.message });
        setIsReviewingPayment(false);
        return;
      }

      setStatusFeedback({ type: "success", message: result.message });
      setPayment((prev) =>
        prev
          ? {
              ...prev,
              status: "rejected",
              rejectionReason: rejectReason.trim(),
            }
          : null
      );
      setOrder((prev) => ({
        ...prev,
        paymentStatus: "rejected",
        orderStatus: "on_hold",
      }));
      setIsRejectDialogOpen(false);
      setRejectReason("");
      setIsReviewingPayment(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject payment.";
      setStatusFeedback({ type: "error", message: msg });
      setIsReviewingPayment(false);
    }
  };

  const formattedStatus = formatOrderStatus(order.orderStatus);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-espresso-muted hover:text-espresso-deep mb-2 inline-flex items-center gap-1 transition-colors"
          >
            &larr; Back to Orders Queue
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-headline font-bold text-3xl text-espresso-deep font-mono">
              {order.reference}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${formattedStatus.badgeClass}`}
            >
              {formattedStatus.label}
            </span>
          </div>
          <p className="text-xs text-espresso-muted mt-1">
            Placed on {new Date(order.createdAt).toLocaleString("en-PK")} &bull; Order ID: {order.id}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] text-espresso-muted block font-medium">Order Total</span>
          <span className="font-headline font-bold text-2xl text-espresso-deep">
            {formatMoney(order.totalMinor)}
          </span>
        </div>
      </div>

      {statusFeedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-3 ${
            statusFeedback.type === "success"
              ? "bg-secondary/15 text-secondary border border-secondary/30"
              : "bg-error/10 text-error border border-error/30"
          }`}
        >
          <span className="text-base shrink-0">
            {statusFeedback.type === "success" ? "✓" : "⚠️"}
          </span>
          <p>{statusFeedback.message}</p>
        </div>
      )}

      {/* Grid: Main Controls & Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Administrative Action Center */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Progression Card */}
          <div className="p-6 rounded-3xl bg-surface-custard border border-border-warm shadow-xs space-y-4">
            <h2 className="font-headline font-bold text-lg text-espresso-deep flex items-center gap-2">
              <span>⚙️</span> Order Lifecycle Progression
            </h2>

            {allowedNextStatuses.length === 0 ? (
              <p className="text-xs text-espresso-muted p-3 rounded-xl bg-surface-cloud">
                This order is in a terminal state ({order.orderStatus}). No further status transitions allowed.
              </p>
            ) : (
              <form onSubmit={handleStatusTransition} className="space-y-4">
                <div>
                  <label htmlFor="targetStatus" className="block text-xs font-bold text-espresso-deep mb-1.5">
                    Advance Status To:
                  </label>
                  <select
                    id="targetStatus"
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as OrderStatus)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border-warm bg-surface-cloud text-espresso-deep text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {allowedNextStatuses.map((st) => (
                      <option key={st} value={st}>
                        {formatOrderStatus(st).label} ({st})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shipped-specific courier tracking inputs */}
                {targetStatus === "shipped" && (
                  <div className="p-4 rounded-2xl bg-peach-tint/50 border border-primary/20 space-y-3">
                    <span className="font-bold text-xs text-espresso-deep block">
                      Courier Dispatch Details
                    </span>
                    <div>
                      <label htmlFor="courierPartner" className="block text-[11px] font-bold text-espresso-deep mb-1">
                        Courier Partner
                      </label>
                      <select
                        id="courierPartner"
                        value={courierPartner}
                        onChange={(e) => setCourierPartner(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-border-warm bg-surface-cloud text-xs focus:ring-2 focus:ring-primary"
                      >
                        {COURIER_PARTNERS.map((cp) => (
                          <option key={cp} value={cp}>
                            {cp}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="trackingNumber" className="block text-[11px] font-bold text-espresso-deep mb-1">
                        Tracking Number / CN # <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        id="trackingNumber"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        required
                        placeholder="e.g. TRX-12345678"
                        className="w-full px-3 py-2 rounded-xl border border-border-warm bg-surface-cloud text-xs font-mono focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label htmlFor="trackingUrl" className="block text-[11px] font-bold text-espresso-deep mb-1">
                        Tracking URL (Optional)
                      </label>
                      <input
                        type="url"
                        id="trackingUrl"
                        value={trackingUrl}
                        onChange={(e) => setTrackingUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl border border-border-warm bg-surface-cloud text-xs focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="statusNote" className="block text-xs font-bold text-espresso-deep mb-1.5">
                    Internal Note / Milestone Log
                  </label>
                  <textarea
                    id="statusNote"
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Batch sculpted & cured in oven at 130°C."
                    className="w-full px-3 py-2 rounded-xl border border-border-warm bg-surface-cloud text-xs focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="w-full py-3 px-4 rounded-full bg-primary text-white font-bold text-xs text-center block hover:bg-opacity-95 shadow-sm disabled:opacity-50 transition-all"
                >
                  {isUpdatingStatus ? "Updating Status..." : `Advance Order to ${formatOrderStatus(targetStatus).label}`}
                </button>
              </form>
            )}
          </div>

          {/* Payment Verification Inspection Card */}
          <div className="p-6 rounded-3xl bg-surface-custard border border-border-warm shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border-warm pb-3">
              <h2 className="font-headline font-bold text-lg text-espresso-deep flex items-center gap-2">
                <span>💳</span> Manual Payment Audit
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  order.paymentStatus === "verified"
                    ? "bg-secondary/15 text-secondary"
                    : order.paymentStatus === "verification_pending"
                    ? "bg-peach-tint text-primary"
                    : order.paymentStatus === "rejected"
                    ? "bg-error/15 text-error"
                    : "bg-surface-cloud text-espresso-muted"
                }`}
              >
                {order.paymentStatus.replace("_", " ")}
              </span>
            </div>

            {payment?.paymentMethodSnapshot ? (
              <div className="p-3.5 rounded-2xl bg-surface-cloud border border-border-warm text-xs space-y-1.5">
                <p>
                  <span className="text-espresso-muted">Method:</span>{" "}
                  <strong>{payment.paymentMethodSnapshot.methodName}</strong>
                </p>
                <p>
                  <span className="text-espresso-muted">Sender Title:</span>{" "}
                  <strong>{payment.paymentMethodSnapshot.senderName}</strong>
                </p>
                <p>
                  <span className="text-espresso-muted">Transaction ID:</span>{" "}
                  <strong className="font-mono text-primary">
                    {payment.paymentMethodSnapshot.transactionId}
                  </strong>
                </p>
                {payment.proofStoragePath && (
                  <p className="pt-1">
                    <span className="text-espresso-muted">Screenshot Proof:</span>{" "}
                    <span className="font-mono text-[10px] text-espresso-deep truncate block">
                      {payment.proofStoragePath}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-espresso-muted">
                No transfer proof submitted yet by the customer.
              </p>
            )}

            {payment?.rejectionReason && (
              <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-xs text-error">
                <strong>Rejection Reason: </strong>
                {payment.rejectionReason}
              </div>
            )}

            {/* Quick Action Buttons for verification_pending */}
            {payment?.status === "verification_pending" && (
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleVerifyPayment}
                  disabled={isReviewingPayment}
                  className="flex-1 py-2.5 px-3 rounded-full bg-secondary text-white font-bold text-xs hover:bg-opacity-95 shadow-sm transition-all"
                >
                  ✓ Verify Payment
                </button>
                <button
                  type="button"
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={isReviewingPayment}
                  className="flex-1 py-2.5 px-3 rounded-full bg-surface-cloud border border-error text-error font-bold text-xs hover:bg-error/10 transition-colors"
                >
                  ✕ Reject Proof
                </button>
              </div>
            )}

            {/* Rejection Dialog Modal */}
            {isRejectDialogOpen && (
              <div className="p-4 rounded-2xl bg-surface-cloud border border-error/30 space-y-3">
                <span className="font-bold text-xs text-error block">
                  Reject Payment Proof
                </span>
                <p className="text-[11px] text-espresso-muted">
                  Provide a specific reason. The customer will see this on their tracking page to re-submit:
                </p>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Transaction ID was not found on our Meezan Bank statement."
                  className="w-full px-3 py-2 rounded-xl border border-border-warm text-xs focus:ring-2 focus:ring-error"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRejectDialogOpen(false)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-espresso-muted hover:text-espresso-deep"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectPayment}
                    className="px-4 py-1.5 rounded-full bg-error text-white text-xs font-bold shadow-xs hover:bg-opacity-95"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Studio Messaging Thread Link */}
          <div className="p-5 rounded-3xl bg-surface-custard border border-border-warm shadow-xs flex items-center justify-between gap-4">
            <div>
              <h3 className="font-headline font-bold text-sm text-espresso-deep flex items-center gap-1.5">
                <span>💬</span> Studio Inquiries &amp; Messages
              </h3>
              <p className="text-[11px] text-espresso-muted mt-0.5">
                Direct chat with customer, photo references, and private artisan notes.
              </p>
            </div>
            <Link
              href="/admin/conversations"
              className="px-3.5 py-2 rounded-xl bg-surface-cloud border border-border-warm text-espresso-deep font-bold text-xs hover:bg-surface-container transition-colors shrink-0"
            >
              Open Inbox &rarr;
            </Link>
          </div>
        </div>

        {/* Right: Order Details, Delivery Address & Audit Trail */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Shipping Details */}
          <div className="p-6 rounded-3xl bg-surface-custard border border-border-warm shadow-xs space-y-3">
            <h2 className="font-headline font-bold text-lg text-espresso-deep border-b border-border-warm pb-3">
              Customer &amp; Shipping Destination
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-espresso-muted block font-medium">Customer:</span>
                <span className="font-bold text-sm text-espresso-deep">
                  {order.shippingAddressSnapshot.fullName}
                </span>
                <span className="block text-espresso-muted mt-0.5">
                  Phone: {order.shippingAddressSnapshot.phone}
                </span>
                <span className="block text-espresso-muted">
                  Email: {order.shippingAddressSnapshot.email}
                </span>
              </div>

              <div>
                <span className="text-espresso-muted block font-medium">Shipping Address:</span>
                <p className="font-medium text-espresso-deep leading-relaxed mt-0.5">
                  {order.shippingAddressSnapshot.streetAddress}
                  <br />
                  {order.shippingAddressSnapshot.city},{" "}
                  {order.shippingAddressSnapshot.province}{" "}
                  {order.shippingAddressSnapshot.postalCode}
                </p>
                {order.shippingAddressSnapshot.orderNotes && (
                  <p className="mt-2 text-[11px] text-espresso-deep bg-surface-cloud p-2 rounded-xl border border-border-warm/50">
                    <strong>Delivery Note:</strong> {order.shippingAddressSnapshot.orderNotes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ordered Charms List */}
          <div className="p-6 rounded-3xl bg-surface-custard border border-border-warm shadow-xs space-y-4">
            <h2 className="font-headline font-bold text-lg text-espresso-deep border-b border-border-warm pb-3">
              Commission Items ({order.items.length})
            </h2>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-2 border-b border-border-warm/40 last:border-0 text-xs"
                >
                  <div className="relative w-14 h-14 rounded-xl bg-surface-cloud overflow-hidden shrink-0 border border-border-warm/50">
                    {item.customizationSnapshot?.imageUrl ? (
                      <Image
                        src={item.customizationSnapshot.imageUrl}
                        alt={item.productTitle}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-espresso-muted">
                        Charm
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-sm text-espresso-deep truncate block">
                      {item.productTitle}
                    </span>
                    <span className="text-espresso-muted text-[11px]">
                      Qty: {item.quantity} &times; {formatMoney(item.unitPriceMinor)}
                    </span>

                    {item.customizationSnapshot?.customization && (
                      <div className="text-[11px] text-espresso-muted mt-0.5">
                        {Object.entries(item.customizationSnapshot.customization).map(([k, v]) => (
                          <span key={k} className="mr-2">
                            {k}: <strong className="text-espresso-deep">{v}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    {item.customizationSnapshot?.customText && (
                      <p className="text-[11px] text-primary font-mono font-bold mt-0.5">
                        Stamped: &quot;{item.customizationSnapshot.customText}&quot;
                      </p>
                    )}
                  </div>

                  <span className="font-bold text-sm text-espresso-deep shrink-0">
                    {formatMoney(item.totalMinor)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status History & Audit Trail */}
          <div className="p-6 rounded-3xl bg-surface-custard border border-border-warm shadow-xs space-y-4">
            <h2 className="font-headline font-bold text-lg text-espresso-deep border-b border-border-warm pb-3 flex items-center justify-between">
              <span>Status History &amp; Audit Trail</span>
              <span className="text-xs font-normal text-espresso-muted">
                {history.length} {history.length === 1 ? "event" : "events"}
              </span>
            </h2>

            <div className="space-y-3">
              {history.map((h, i) => (
                <div
                  key={h.id || i}
                  className="p-3 rounded-2xl bg-surface-cloud border border-border-warm/70 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-espresso-deep">
                        {h.previousStatus} &rarr; {h.newStatus}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-peach-tint text-primary font-semibold uppercase">
                        {h.actorType}
                      </span>
                    </div>
                    {h.note && (
                      <p className="text-[11px] text-espresso-muted">{h.note}</p>
                    )}
                  </div>

                  <span className="text-[10px] text-espresso-muted shrink-0 whitespace-nowrap">
                    {new Date(h.createdAt).toLocaleString("en-PK", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

