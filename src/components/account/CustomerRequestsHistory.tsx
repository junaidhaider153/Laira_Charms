"use client";

import React from "react";
import Link from "next/link";
import type { CustomRequest } from "@/lib/custom-order/types";

interface CustomerRequestsHistoryProps {
  requests: CustomRequest[];
}

export function CustomerRequestsHistory({ requests }: CustomerRequestsHistoryProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 p-6 rounded-3xl bg-surface-custard border border-border-warm text-espresso-muted">
        <span className="text-4xl mb-3 block">🎨</span>
        <h3 className="font-headline font-bold text-base text-espresso-deep">
          No Bespoke Inquiries Yet
        </h3>
        <p className="text-xs text-espresso-muted mt-1 max-w-sm mx-auto">
          Have an idea for a customized clay figurine, wedding keepsake, or corporate nameplate?
        </p>
        <Link
          href="/custom-order"
          className="inline-block mt-4 px-6 py-2.5 rounded-full bg-strawberry-blush text-on-primary text-xs font-bold hover:opacity-95 shadow-xs transition-all active:scale-95"
        >
          Commission a Bespoke Design &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-headline font-bold text-xl text-espresso-deep">
          Bespoke Atelier Commissions
        </h2>
        <p className="text-xs text-espresso-muted mt-0.5">
          Review artisan status, incoming quotes, and craft conversation notes for your custom requests.
        </p>
      </div>

      <div className="space-y-3">
        {requests.map((req) => {
          const dateStr = new Date(req.createdAt).toLocaleDateString("en-PK", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={req.id}
              className="p-6 rounded-3xl bg-surface-cloud border border-border-warm/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-strawberry-blush/30 hover:shadow-sm"
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-base text-espresso-deep">
                    {req.title}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === "quote_issued"
                        ? "bg-matcha-soft text-white"
                        : req.status === "accepted"
                        ? "bg-matcha-tint text-matcha-soft border border-matcha-soft/30"
                        : "bg-peach-tint text-strawberry-blush-dark border border-strawberry-blush/20"
                    }`}
                  >
                    {req.status.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-espresso-muted line-clamp-2 leading-relaxed">
                  {req.brief}
                </p>

                <div className="text-[11px] text-espresso-muted flex items-center gap-3">
                  <span>Submitted on {dateStr}</span>
                  {req.desiredDeliveryDate && (
                    <>
                      <span>•</span>
                      <span>Target: {new Date(req.desiredDeliveryDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border-warm/40">
                <Link
                  href={`/custom-order/status/${req.id}`}
                  className="px-5 py-2 rounded-full bg-surface-custard border border-border-warm text-espresso-deep font-bold text-xs hover:bg-surface-container transition-all whitespace-nowrap active:scale-95"
                >
                  View Status &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
