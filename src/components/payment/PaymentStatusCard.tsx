"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PaymentInstructionsCard } from "./PaymentInstructionsCard";
import { ProofUploadForm } from "./ProofUploadForm";
import type { Order } from "@/lib/checkout/types";
import type { PaymentRecord } from "@/lib/payment/types";
import { formatMoney } from "@/lib/utils";

interface PaymentStatusCardProps {
  order: Order;
  initialPayment: PaymentRecord;
  guestToken?: string;
}

export function PaymentStatusCard({
  order,
  initialPayment,
  guestToken,
}: PaymentStatusCardProps) {
  const [payment, setPayment] = useState<PaymentRecord>(initialPayment);

  const handleProofSubmitted = (updatedPayment?: unknown) => {
    if (updatedPayment && typeof updatedPayment === "object") {
      setPayment(updatedPayment as PaymentRecord);
    } else {
      setPayment((prev) => ({
        ...prev,
        status: "verification_pending",
        proofSubmittedAt: new Date().toISOString(),
      }));
    }
  };

  const orderUrl = guestToken
    ? `/orders/${order.reference}?token=${encodeURIComponent(guestToken)}`
    : `/orders/${order.reference}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={orderUrl}
            className="text-xs font-semibold text-espresso-muted hover:text-espresso-deep mb-2 inline-flex items-center gap-1 transition-colors"
          >
            &larr; Back to Order Details
          </Link>
          <h1 className="font-headline font-bold text-3xl text-espresso-deep">
            Payment &amp; Verification
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1">
            Order Reference: <span className="font-mono font-bold text-primary">{order.reference}</span>
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[11px] text-espresso-muted block font-medium">Order Total</span>
          <span className="font-headline font-bold text-2xl text-espresso-deep">
            {formatMoney(order.totalMinor)}
          </span>
        </div>
      </div>

      {/* STATE 1: VERIFIED */}
      {payment.status === "verified" && (
        <div className="p-8 rounded-3xl bg-surface-custard border-2 border-secondary/40 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-3xl">
            ✨
          </div>
          <span className="inline-block px-3.5 py-1 rounded-full bg-secondary/20 text-secondary font-bold text-xs uppercase tracking-wider">
            Payment Verified &bull; Confirmed
          </span>
          <h2 className="font-headline font-bold text-2xl sm:text-3xl text-espresso-deep">
            Your Payment is Confirmed!
          </h2>
          <p className="text-espresso-muted text-sm sm:text-base max-w-lg mx-auto">
            Our studio has verified your bank transfer on our account statement. Your handmade charms are now scheduled for custom sculpting and glaze baking!
          </p>
          <div className="pt-2">
            <Link
              href={orderUrl}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-white font-bold text-xs hover:bg-opacity-95 shadow-sm transition-all"
            >
              View Order Confirmation &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* STATE 2: VERIFICATION PENDING */}
      {payment.status === "verification_pending" && (
        <div className="p-8 rounded-3xl bg-peach-tint/70 border border-primary/30 shadow-xs space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl shrink-0">
              ⏳
            </div>
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-primary/15 text-primary font-bold text-[10px] uppercase tracking-wider mb-1">
                Under Studio Review
              </span>
              <h2 className="font-headline font-bold text-2xl text-espresso-deep">
                Payment Proof Received
              </h2>
              <p className="text-xs sm:text-sm text-espresso-muted mt-1 leading-relaxed">
                Thank you! We have received your screenshot proof. Our artisan cross-references bank and mobile wallet statements within <span className="font-bold text-espresso-deep">2 to 4 business hours</span>. Once confirmed, you will receive an update and your commission will begin crafting.
              </p>
            </div>
          </div>

          {payment.paymentMethodSnapshot && (
            <div className="p-4 rounded-2xl bg-surface-cloud border border-border-warm text-xs space-y-1.5">
              <span className="font-bold text-espresso-deep block mb-1">Submitted Transfer Details:</span>
              <p className="text-espresso-muted">
                Method: <strong className="text-espresso-deep">{payment.paymentMethodSnapshot.methodName}</strong>
              </p>
              <p className="text-espresso-muted">
                Sender Account: <strong className="text-espresso-deep">{payment.paymentMethodSnapshot.senderName}</strong>
              </p>
              <p className="text-espresso-muted">
                Transaction / Ref ID: <strong className="font-mono text-primary">{payment.paymentMethodSnapshot.transactionId}</strong>
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href={orderUrl}
              className="py-3 px-6 rounded-full bg-surface-cloud border border-border-warm text-espresso-deep font-bold text-xs text-center hover:bg-surface-container transition-all"
            >
              Review Order Details
            </Link>
            <Link
              href="/shop"
              className="py-3 px-6 rounded-full bg-primary text-white font-bold text-xs text-center hover:bg-opacity-95 shadow-sm transition-all"
            >
              Explore More Handmade Keepsakes
            </Link>
          </div>
        </div>
      )}

      {/* STATE 3: REJECTED */}
      {payment.status === "rejected" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-error/10 border border-error/30 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">⚠️</span>
              <div>
                <h2 className="font-headline font-bold text-lg text-error">
                  Payment Verification Notice
                </h2>
                <p className="text-xs text-espresso-muted mt-1">
                  Our studio could not verify the transfer with the details provided:
                </p>
                <div className="mt-2 p-3 rounded-xl bg-surface-custard border border-error/20 text-xs text-espresso-deep font-medium italic">
                  &ldquo;{payment.rejectionReason}&rdquo;
                </div>
                <p className="text-[11px] text-espresso-muted mt-2">
                  Please review our verified account details below and re-submit your transaction screenshot.
                </p>
              </div>
            </div>
          </div>

          <PaymentInstructionsCard
            amountMinor={order.totalMinor}
            orderReference={order.reference}
          />

          <ProofUploadForm
            orderReference={order.reference}
            guestToken={guestToken}
            onSuccess={handleProofSubmitted}
          />
        </div>
      )}

      {/* STATE 4: AWAITING PAYMENT */}
      {payment.status === "awaiting_payment" && (
        <div className="space-y-8">
          <PaymentInstructionsCard
            amountMinor={order.totalMinor}
            orderReference={order.reference}
          />

          <ProofUploadForm
            orderReference={order.reference}
            guestToken={guestToken}
            onSuccess={handleProofSubmitted}
          />
        </div>
      )}
    </div>
  );
}
