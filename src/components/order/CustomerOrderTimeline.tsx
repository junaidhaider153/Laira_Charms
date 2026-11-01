"use client";

import React from "react";
import type { OrderStatus } from "@/lib/order/lifecycle";

interface CustomerOrderTimelineProps {
  orderStatus: OrderStatus;
  paymentStatus: string;
  notes?: string | null;
}

interface Step {
  id: string;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  {
    id: "placed",
    label: "Order Placed",
    description: "Keepsake commission received via online store.",
  },
  {
    id: "verified",
    label: "Payment Verified",
    description: "Bank/wallet transfer verified by our studio.",
  },
  {
    id: "crafting",
    label: "Studio Crafting",
    description: "Handcrafted sculpting, oven-curing & triple UV diamond glaze.",
  },
  {
    id: "dispatched",
    label: "Dispatched",
    description: "Handed over to courier partner for nationwide delivery.",
  },
  {
    id: "delivered",
    label: "Delivered",
    description: "Delivered safely to your destination.",
  },
];

export function CustomerOrderTimeline({
  orderStatus,
  paymentStatus,
  notes,
}: CustomerOrderTimelineProps) {
  // Determine current active step index (0 to 4)
  let activeIndex = 0;

  if (orderStatus === "delivered") {
    activeIndex = 4;
  } else if (orderStatus === "shipped") {
    activeIndex = 3;
  } else if (orderStatus === "in_production" || orderStatus === "ready_to_ship") {
    activeIndex = 2;
  } else if (orderStatus === "confirmed" || paymentStatus === "verified") {
    activeIndex = 1;
  } else {
    activeIndex = 0;
  }

  // Extract courier tracking info from notes if available
  const hasTracking = notes && (notes.includes("Courier:") || notes.includes("Dispatched via"));
  let courierInfo: { partner?: string; trackingNumber?: string; url?: string } | null = null;

  if (hasTracking && notes) {
    const courierMatch = notes.match(/Courier:\s*([^|\n]+)/i) || notes.match(/Dispatched via\s*([^(\n]+)/i);
    const trackingMatch = notes.match(/(?:CN|trackingNumber):\s*([^|\n)]+)/i);
    const urlMatch = notes.match(/URL:\s*(https?:\/\/[^\s]+)/i);

    if (courierMatch || trackingMatch) {
      courierInfo = {
        partner: courierMatch?.[1]?.trim(),
        trackingNumber: trackingMatch?.[1]?.trim(),
        url: urlMatch?.[1]?.trim(),
      };
    }
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-surface-custard border border-border-warm shadow-xs space-y-6">
      <div className="border-b border-border-warm pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-headline font-bold text-xl text-espresso-deep">
            Artisanal Commission Progress
          </h2>
          <p className="text-xs text-espresso-muted mt-0.5">
            Follow your handcrafted keepsake through each studio milestone.
          </p>
        </div>

        {orderStatus === "on_hold" && (
          <span className="px-3 py-1 rounded-full bg-error/15 text-error font-bold text-xs self-start sm:self-auto flex items-center gap-1.5">
            <span>⚠️</span> On Hold (Action Needed)
          </span>
        )}
      </div>

      {/* Stepper Timeline */}
      <ol className="relative border-l-2 border-border-warm ml-4 sm:ml-6 space-y-8" role="list">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex || (idx === activeIndex && orderStatus === "delivered");
          const isCurrent = idx === activeIndex && orderStatus !== "delivered";

          return (
            <li
              key={step.id}
              className="ml-6 relative"
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Stepper Icon Indicator */}
              <span
                className={`absolute -left-9 sm:-left-10 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-secondary text-white border-secondary"
                    : isCurrent
                    ? "bg-primary text-white border-primary ring-4 ring-primary/20 animate-pulse"
                    : "bg-surface-cloud text-espresso-muted border-border-warm"
                }`}
              >
                {isCompleted ? "✓" : idx + 1}
              </span>

              {/* Step Details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-headline font-bold text-sm sm:text-base ${
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-espresso-deep"
                        : "text-espresso-muted"
                    }`}
                  >
                    {step.label}
                  </h3>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      Current Stage
                    </span>
                  )}
                </div>

                <p className="text-xs text-espresso-muted leading-relaxed">
                  {step.description}
                </p>

                {/* Tracking info callout on Dispatched step */}
                {step.id === "dispatched" && (isCompleted || isCurrent) && courierInfo && (
                  <div className="mt-3 p-3 rounded-2xl bg-surface-cloud border border-border-warm/80 text-xs text-espresso-deep space-y-1.5 inline-block">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📦</span>
                      <span className="font-bold">
                        Courier: {courierInfo.partner || "Nationwide Courier"}
                      </span>
                    </div>
                    {courierInfo.trackingNumber && (
                      <p className="text-[11px] text-espresso-muted font-mono">
                        Tracking Number (CN): <strong className="text-espresso-deep">{courierInfo.trackingNumber}</strong>
                      </p>
                    )}
                    {courierInfo.url && (
                      <a
                        href={courierInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline mt-1"
                      >
                        Track Package with Courier &rarr;
                      </a>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

