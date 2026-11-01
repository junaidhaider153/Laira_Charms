"use client";

import React, { useState } from "react";
import { PAKISTANI_PAYMENT_ACCOUNTS } from "@/lib/payment/bank-details";
import { formatMoney } from "@/lib/utils";

interface PaymentInstructionsCardProps {
  amountMinor: number;
  orderReference: string;
}

export function PaymentInstructionsCard({
  amountMinor,
  orderReference,
}: PaymentInstructionsCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-surface-cloud border border-border-warm/50 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-warm/50 pb-5">
        <div>
          <h2 className="font-headline font-bold text-xl sm:text-2xl text-espresso-deep">
            Bank &amp; Wallet Transfer Details
          </h2>
          <p className="font-body-sm text-xs sm:text-sm text-espresso-muted mt-0.5">
            Please transfer the exact amount due to any of our studio accounts below.
          </p>
        </div>
        <div className="sm:text-right">
          <span className="block font-label-sm text-[11px] text-espresso-muted font-medium">Total Amount Due</span>
          <span className="font-headline font-bold text-2xl sm:text-3xl text-strawberry-blush">
            {formatMoney(amountMinor)}
          </span>
        </div>
      </div>

      {/* Reference Notice */}
      <div className="p-4 rounded-2xl bg-surface-custard border border-border-warm/60 flex items-center justify-between gap-3 text-xs shadow-xs">
        <div>
          <span className="font-bold text-espresso-deep">Important: </span>
          <span className="text-espresso-muted">
            Include your order reference in the payment remarks:
          </span>
        </div>
        <button
          onClick={() => handleCopy(orderReference, "ref")}
          className="px-3.5 py-1.5 rounded-full bg-surface-cloud border border-border-warm font-mono font-bold text-strawberry-blush hover:bg-strawberry-subtle transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
          title="Click to copy reference"
        >
          <span>{orderReference}</span>
          <span className="text-[10px] text-espresso-muted font-sans font-normal">
            {copiedId === "ref" ? "✓ Copied" : "Copy"}
          </span>
        </button>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PAKISTANI_PAYMENT_ACCOUNTS.map((account) => (
          <div
            key={account.id}
            className="p-5 rounded-3xl bg-canvas-butter border border-border-warm/60 flex flex-col justify-between space-y-3 shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-espresso-deep">{account.name}</span>
                <span className="font-label-sm text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-peach-tint text-tertiary">
                  {account.badge}
                </span>
              </div>

              <div className="text-xs space-y-2 text-espresso-deep">
                <div>
                  <span className="text-[11px] text-espresso-muted block">Account Title:</span>
                  <span className="font-bold text-espresso-deep">{account.accountTitle}</span>
                </div>

                <div>
                  <span className="text-[11px] text-espresso-muted block">Account Number:</span>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="font-mono text-xs font-bold text-espresso-deep">{account.accountNumber}</span>
                    <button
                      onClick={() => handleCopy(account.accountNumber, `${account.id}-acc`)}
                      className="text-[10px] text-strawberry-blush hover:underline font-bold"
                    >
                      {copiedId === `${account.id}-acc` ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {account.iban && (
                  <div>
                    <span className="text-[11px] text-espresso-muted block">IBAN:</span>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="font-mono text-[11px] font-bold text-espresso-deep truncate">{account.iban}</span>
                      <button
                        onClick={() => handleCopy(account.iban!, `${account.id}-iban`)}
                        className="text-[10px] text-strawberry-blush hover:underline font-bold shrink-0 ml-1"
                      >
                        {copiedId === `${account.id}-iban` ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-border-warm/40 text-[10px] text-espresso-muted">
              {account.instructions || "Instant Raast or wallet confirmation supported."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
