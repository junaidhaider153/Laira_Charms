"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { PaymentInstructionsCard } from "./PaymentInstructionsCard";
import { ProofUploadForm } from "./ProofUploadForm";
import type { Order } from "@/lib/checkout/types";
import type { PaymentRecord } from "@/lib/payment/types";
import { formatMoney } from "@/lib/utils";
import type { PaymentAccount } from "@/lib/payment/bank-details";

interface PaymentStatusCardProps {
  order: Order;
  initialPayment: PaymentRecord;
  guestToken?: string;
  accounts?: PaymentAccount[];
}

export function PaymentStatusCard({
  order,
  initialPayment,
  guestToken,
  accounts,
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
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={orderUrl}
            className="text-xs font-semibold text-espresso-muted hover:text-espresso-deep mb-2 inline-flex items-center gap-1 transition-colors"
          >
            &larr; Back to Order Details
          </Link>
          <h1 className="font-headline font-bold text-3xl sm:text-4xl text-espresso-deep">
            Payment &amp; Verification
          </h1>
          <p className="font-body-sm text-xs sm:text-sm text-espresso-muted mt-1">
            Order Reference: <span className="font-mono font-bold text-strawberry-blush">{order.reference}</span>
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="font-label-sm text-[11px] text-espresso-muted block font-medium">Order Total</span>
          <span className="font-headline font-bold text-2xl sm:text-3xl text-espresso-deep">
            {formatMoney(order.totalMinor)}
          </span>
        </div>
      </div>

      {/* STATE 1: VERIFIED */}
      {payment.status === "verified" && (
        <div className="p-8 sm:p-10 rounded-3xl bg-surface-cloud border-2 border-secondary/40 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-matcha-tint text-secondary flex items-center justify-center text-3xl shadow-xs">
            ✨
          </div>
          <span className="inline-block px-4 py-1 rounded-full bg-matcha-tint text-secondary font-bold text-xs uppercase tracking-wider">
            Payment Verified &bull; Confirmed
          </span>
          <h2 className="font-headline font-bold text-2xl sm:text-3xl text-espresso-deep">
            Your Payment is Confirmed!
          </h2>
          <p className="font-body-md text-espresso-muted text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Our studio has verified your bank transfer on our account statement. Your handmade charms are now scheduled for custom sculpting and glaze baking!
          </p>
          <div className="pt-2">
            <Link
              href={orderUrl}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-strawberry-blush text-on-primary font-bold text-xs hover:opacity-95 shadow-sm transition-all active:scale-95"
            >
              <span>View Order Confirmation</span>
              <Icon name="arrow_forward" className="text-[16px]" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}

      {/* STATE 2: VERIFICATION PENDING */}
      {payment.status === "verification_pending" && (
        <div className="p-8 sm:p-10 rounded-3xl bg-surface-cloud border border-border-warm/50 shadow-sm space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-peach-tint text-tertiary flex items-center justify-center text-2xl shrink-0 shadow-xs">
              ⏳
            </div>
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-peach-tint text-tertiary font-bold text-xs uppercase tracking-wider mb-2">
                Under Studio Review
              </span>
              <h2 className="font-headline font-bold text-xl sm:text-2xl text-espresso-deep">
                Payment Proof Received
              </h2>
              <p className="font-body-sm text-xs sm:text-sm text-espresso-muted mt-1 leading-relaxed">
                Thank you! We received your proof upload on{" "}
                <span className="font-semibold text-espresso-deep">
                  {payment.proofSubmittedAt
                    ? new Date(payment.proofSubmittedAt).toLocaleString("en-PK")
                    : "record"}
                </span>
                . Our studio artists manually match transaction references with our bank statements.
              </p>
            </div>
          </div>

          {payment.paymentMethodSnapshot && (
            <div className="p-4 rounded-2xl bg-surface-custard border border-border-warm text-xs space-y-1">
              <p className="text-espresso-muted">
                Method: <strong className="text-espresso-deep">{payment.paymentMethodSnapshot.methodName}</strong>
              </p>
              <p className="text-espresso-muted">
                Sender Account: <strong className="text-espresso-deep">{payment.paymentMethodSnapshot.senderName}</strong>
              </p>
              <p className="text-espresso-muted">
                Transaction / Ref ID: <strong className="font-mono text-strawberry-blush">{payment.paymentMethodSnapshot.transactionId}</strong>
              </p>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-surface-custard/60 border border-border-warm/50 text-xs text-espresso-muted space-y-1">
            <p className="font-semibold text-espresso-deep">What happens next?</p>
            <p>
              Once approved, your order moves to confirmed status and enters our handmade baking queue. You will receive an email confirmation notification.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end">
            <Link
              href={orderUrl}
              className="px-6 py-3 rounded-full bg-surface-cloud text-espresso-deep font-semibold text-xs hover:bg-surface-custard transition-colors border border-border-warm text-center shadow-xs"
            >
              Review Order Details
            </Link>
            <Link
              href="/shop"
              className="px-6 py-3 rounded-full bg-strawberry-blush text-on-primary font-bold text-xs hover:opacity-95 transition-all text-center shadow-xs"
            >
              Explore More Handmade Keepsakes
            </Link>
          </div>
        </div>
      )}

      {/* STATE 3: REJECTED */}
      {payment.status === "rejected" && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-error/5 border border-error/30 shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-error/15 text-error flex items-center justify-center text-2xl shrink-0">
                ⚠️
              </div>
              <div>
                <span className="inline-block px-3 py-0.5 rounded-full bg-error/15 text-error font-bold text-xs uppercase tracking-wider mb-2">
                  Payment Verification Notice
                </span>
                <h2 className="font-headline font-bold text-xl text-espresso-deep">
                  Our studio could not verify the transfer with the details provided:
                </h2>
                <div className="mt-2 p-3.5 rounded-2xl bg-surface-custard border border-error/20 text-xs text-espresso-deep font-medium italic">
                  &ldquo;{payment.rejectionReason}&rdquo;
                </div>
                <p className="text-xs text-espresso-muted mt-2">
                  Please review our verified account details below and re-submit your transaction screenshot.
                </p>
              </div>
            </div>
          </div>

          <PaymentInstructionsCard
            amountMinor={order.totalMinor}
            orderReference={order.reference}
            accounts={accounts}
          />

          <ProofUploadForm
            orderReference={order.reference}
            guestToken={guestToken}
            accounts={accounts}
            onSuccess={handleProofSubmitted}
          />
        </div>
      )}

      {/* STATE 4: AWAITING PAYMENT (Default initial state) */}
      {payment.status === "awaiting_payment" && (
        <div className="space-y-8">
          <PaymentInstructionsCard
            amountMinor={order.totalMinor}
            orderReference={order.reference}
            accounts={accounts}
          />

          <ProofUploadForm
            orderReference={order.reference}
            guestToken={guestToken}
            accounts={accounts}
            onSuccess={handleProofSubmitted}
          />
        </div>
      )}
    </div>
  );
}
