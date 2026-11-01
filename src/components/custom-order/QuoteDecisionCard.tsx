"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { respondToQuotationAction } from "@/lib/custom-order/actions";
import type { Quotation, CustomRequest } from "@/lib/custom-order/types";

interface QuoteDecisionCardProps {
  quotation: Quotation;
  request: CustomRequest;
  guestToken?: string;
}

export function QuoteDecisionCard({
  quotation,
  request,
  guestToken,
}: QuoteDecisionCardProps) {
  const [currentQuote, setCurrentQuote] = useState(quotation);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isExpired = currentQuote.isExpired || new Date(currentQuote.validUntil).getTime() < Date.now();
  const isAccepted = currentQuote.status === "accepted";
  const isDeclined = currentQuote.status === "declined";

  const expiryFormatted = new Date(currentQuote.validUntil).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  async function handleDecision(action: "accept" | "decline") {
    if (isExpired && action === "accept") return;

    setIsProcessing(true);
    setFeedback(null);
    setErrorMsg(null);

    const res = await respondToQuotationAction({
      quotationId: currentQuote.id,
      action,
      guestToken,
    });

    setIsProcessing(false);

    if (res.success && res.quotation) {
      setCurrentQuote(res.quotation);
      setFeedback(res.message);
    } else {
      setErrorMsg(res.message || "Failed to submit quotation response.");
    }
  }

  return (
    <div className="bg-surface-cloud p-6 sm:p-10 rounded-3xl border border-border-warm/50 shadow-sm space-y-6 max-w-3xl mx-auto" data-testid="quote-decision-card">
      {/* Header & Status Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-warm/50 pb-5">
        <div>
          <span className="font-label-sm text-[10px] font-bold uppercase tracking-widest text-primary block">
            Official Studio Quotation • Version {currentQuote.version}
          </span>
          <h2 className="font-headline text-xl sm:text-2xl font-bold text-espresso-deep mt-0.5">
            {request.title}
          </h2>
        </div>

        {/* Status Badge */}
        {isAccepted ? (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-matcha-tint text-secondary flex items-center gap-1.5 shadow-xs">
            ✓ Quote Accepted
          </span>
        ) : isDeclined ? (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-red-100 text-error shadow-xs">
            ✕ Quote Declined
          </span>
        ) : isExpired ? (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-red-50 text-error border border-error/30 shadow-xs" role="status">
            ⚠️ Quote Expired
          </span>
        ) : (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-strawberry-subtle text-primary border border-primary/20 shadow-xs">
            ⏳ Pending Decision
          </span>
        )}
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold" role="status">
          ✓ {feedback}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-error/30 text-error text-xs font-semibold" role="alert">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Scope of Work */}
      <div className="space-y-2">
        <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-espresso-muted">
          Artisanal Scope &amp; Specifications
        </h3>
        <div className="p-5 rounded-2xl bg-surface-custard border border-border-warm text-sm text-espresso-deep whitespace-pre-line leading-relaxed shadow-xs">
          {currentQuote.scope}
        </div>
      </div>

      {/* Price & Timing Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-canvas-butter border border-border-warm/60 shadow-xs">
          <span className="font-label-sm text-[11px] text-espresso-muted block font-medium">Approved Amount</span>
          <span className="font-headline text-2xl font-bold text-strawberry-blush block mt-0.5">
            {formatMoney(currentQuote.amountMinor)}
          </span>
          <span className="text-[10px] text-espresso-muted">PKR (Includes gift packaging)</span>
        </div>

        <div className="p-5 rounded-2xl bg-canvas-butter border border-border-warm/60 shadow-xs">
          <span className="font-label-sm text-[11px] text-espresso-muted block font-medium">Production Window</span>
          <span className="font-headline text-2xl font-bold text-espresso-deep block mt-0.5">
            {currentQuote.productionDays} Studio Business Days
          </span>
          <span className="text-[10px] text-espresso-muted">Baking, painting &amp; UV cure</span>
        </div>

        <div className="p-5 rounded-2xl bg-canvas-butter border border-border-warm/60 shadow-xs">
          <span className="font-label-sm text-[11px] text-espresso-muted block font-medium">Offer Valid Until</span>
          <span className="font-headline text-lg sm:text-xl font-bold text-espresso-deep block mt-1">
            {expiryFormatted}
          </span>
          <span className="text-[10px] text-espresso-muted">
            {isExpired ? "Slot expired" : "Locked commission rate"}
          </span>
        </div>
      </div>

      {/* Action Decision Buttons */}
      <div className="pt-2">
        {isAccepted ? (
          <div className="p-5 rounded-3xl bg-matcha-tint text-secondary text-xs font-semibold text-center space-y-3 shadow-xs">
            <p>🎉 Your bespoke commission is officially locked in! Our studio has begun preparing clay batches.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 font-bold underline hover:opacity-80"
            >
              Continue Exploring Shop &rarr;
            </Link>
          </div>
        ) : isDeclined ? (
          <div className="p-5 rounded-3xl bg-surface-custard text-espresso-muted text-xs text-center border border-border-warm">
            This quotation has been declined. If your concept requirements change, feel free to submit a new inquiry anytime!
          </div>
        ) : isExpired ? (
          <div className="p-5 rounded-3xl bg-red-50 border border-error/20 text-center space-y-3">
            <p className="text-xs font-semibold text-error">
              ⚠️ This quotation expired on {expiryFormatted}. For handmade commissions, quotes lock for 7 days to preserve material batch pricing.
            </p>
            <button
              type="button"
              disabled
              className="py-3 px-8 rounded-full bg-espresso-muted/30 text-espresso-muted font-bold text-xs cursor-not-allowed"
              aria-disabled="true"
            >
              Accept Locked (Expired)
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleDecision("accept")}
              className="w-full sm:flex-1 py-4 px-8 rounded-full bg-strawberry-blush hover:opacity-95 text-on-primary font-bold text-xs transition-all shadow-md active:scale-98 disabled:opacity-50 transform hover:-translate-y-0.5"
            >
              {isProcessing ? "Confirming..." : "✓ Accept Quotation & Lock Commission"}
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleDecision("decline")}
              className="w-full sm:w-auto py-4 px-6 rounded-full bg-surface-custard hover:bg-red-50 text-error font-bold text-xs border border-border-warm transition-all disabled:opacity-50 shadow-xs"
            >
              Decline Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
