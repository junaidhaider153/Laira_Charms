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
    <div className="p-6 rounded-3xl bg-surface-custard border border-border-warm shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-warm pb-4">
        <div>
          <h2 className="font-headline font-bold text-xl text-espresso-deep">
            Bank &amp; Wallet Transfer Details
          </h2>
          <p className="text-xs text-espresso-muted mt-0.5">
            Please transfer the exact amount due to any of our studio accounts below.
          </p>
        </div>
        <div className="sm:text-right">
          <span className="block text-[11px] text-espresso-muted font-medium">Total Amount Due</span>
          <span className="font-headline font-bold text-2xl text-primary">
            {formatMoney(amountMinor)}
          </span>
        </div>
      </div>

      {/* Reference Notice */}
      <div className="p-3.5 rounded-2xl bg-peach-tint/60 border border-border-warm/60 flex items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-semibold text-espresso-deep">Important: </span>
          <span className="text-espresso-muted">
            Include your order reference in the payment remarks:
          </span>
        </div>
        <button
          onClick={() => handleCopy(orderReference, "ref")}
          className="px-3 py-1 rounded-lg bg-surface-cloud border border-border-warm font-mono font-bold text-primary hover:bg-surface-container transition-colors shrink-0 flex items-center gap-1.5"
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
            className="p-4 rounded-2xl bg-surface-cloud border border-border-warm/80 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-espresso-deep">{account.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-peach-tint text-primary">
                  {account.badge}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-espresso-deep">
                <div>
                  <span className="text-[11px] text-espresso-muted block">Account Title:</span>
                  <span className="font-semibold">{account.accountTitle}</span>
                </div>

                <div>
                  <span className="text-[11px] text-espresso-muted block">Account Number:</span>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="font-mono text-xs font-bold">{account.accountNumber}</span>
                    <button
                      onClick={() => handleCopy(account.accountNumber, `${account.id}-acc`)}
                      className="text-[10px] text-primary hover:underline font-semibold"
                    >
                      {copiedId === `${account.id}-acc` ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {account.iban && (
                  <div>
                    <span className="text-[11px] text-espresso-muted block">IBAN:</span>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="font-mono text-[10px] font-bold truncate max-w-[150px]">
                        {account.iban}
                      </span>
                      <button
                        onClick={() => handleCopy(account.iban!, `${account.id}-iban`)}
                        className="text-[10px] text-primary hover:underline font-semibold shrink-0"
                      >
                        {copiedId === `${account.id}-iban` ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-espresso-muted border-t border-border-warm/40 pt-2 leading-tight">
              {account.instructions}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
