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
    <div className="bg-surface-cloud p-6 sm:p-10 rounded-3xl border border-border-warm shadow-sm space-y-6 max-w-3xl mx-auto" data-testid="quote-decision-card">
      {/* Header & Status Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-warm pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
            Official Studio Quotation • Version {currentQuote.version}
          </span>
          <h2 className="font-headline text-xl sm:text-2xl font-bold text-espresso-deep mt-0.5">
            {request.title}
          </h2>
        </div>

        {/* Status Badge */}
        {isAccepted ? (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-matcha-tint text-secondary flex items-center gap-1.5">
            ✓ Quote Accepted
          </span>
        ) : isDeclined ? (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-error">
            ✕ Quote Declined
          </span>
        ) : isExpired ? (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-error border border-error/30" role="status">
            ⚠️ Quote Expired
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-strawberry-subtle text-primary border border-primary/20">
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

      {/* Pricing and Lead Time Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-surface-custard border border-border-warm space-y-1">
          <span className="text-xs text-espresso-muted font-medium">All-Inclusive Quotation Total:</span>
          <div className="font-headline text-3xl font-bold text-primary">
            {formatMoney(currentQuote.amountMinor)}
          </div>
          <span className="text-[11px] text-espresso-muted">PKR (includes custom sculpting &amp; gift box)</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-custard border border-border-warm space-y-2 text-xs">
          <div>
            <span className="text-espresso-muted block">Studio Production Craft Time:</span>
            <strong className="text-espresso-deep">{currentQuote.productionDays} Studio Business Days</strong>
          </div>
          <div>
            <span className="text-espresso-muted block">Quotation Validity Window:</span>
            <strong className={isExpired ? "text-error" : "text-espresso-deep"}>
              Valid until {expiryFormatted}
            </strong>
          </div>
        </div>
      </div>

      {/* Scope of Work */}
      <div className="p-5 rounded-2xl bg-surface-custard/50 border border-border-warm space-y-2">
        <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-espresso-deep">
          Studio Scope of Craftsmanship
        </h4>
        <p className="text-xs text-espresso-deep/90 leading-relaxed whitespace-pre-line">
          {currentQuote.scope}
        </p>
      </div>

      {/* Original Brief Reference */}
      <div className="text-xs text-espresso-muted space-y-1 border-t border-border-warm pt-4">
        <span className="font-bold text-espresso-deep block">Original Commission Brief:</span>
        <p className="italic bg-surface-custard px-3 py-2 rounded-xl border border-border-warm/60">
          &ldquo;{request.brief}&rdquo;
        </p>
      </div>

      {/* Action Decision Buttons */}
      <div className="pt-2">
        {isAccepted ? (
          <div className="p-4 rounded-2xl bg-matcha-tint text-secondary text-xs font-semibold text-center space-y-2">
            <p>Your bespoke commission is officially locked in! Our studio has begun preparing clay batches.</p>
            <Link
              href="/shop"
              className="inline-block font-bold underline hover:opacity-80"
            >
              Continue Exploring Shop →
            </Link>
          </div>
        ) : isDeclined ? (
          <div className="p-4 rounded-2xl bg-surface-custard text-espresso-muted text-xs text-center">
            This quotation has been declined. If your concept requirements change, feel free to submit a new inquiry anytime!
          </div>
        ) : isExpired ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-error/20 text-center space-y-3">
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
              className="w-full sm:flex-1 py-4 px-8 rounded-full bg-primary hover:bg-opacity-95 text-white font-bold text-xs transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              {isProcessing ? "Confirming..." : "✓ Accept Quotation & Lock Commission"}
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleDecision("decline")}
              className="w-full sm:w-auto py-4 px-6 rounded-full bg-surface-custard hover:bg-red-50 text-error font-bold text-xs border border-border-warm transition-all disabled:opacity-50"
            >
              Decline Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
