"use client";

import React from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { formatOrderStatus } from "@/lib/order/lifecycle";
import type { Order } from "@/lib/checkout/types";

interface CustomerOrderHistoryProps {
  orders: Order[];
}

export function CustomerOrderHistory({ orders }: CustomerOrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 p-6 rounded-3xl bg-surface-custard border border-border-warm text-espresso-muted">
        <span className="text-4xl mb-3 block">🛍️</span>
        <h3 className="font-headline font-bold text-base text-espresso-deep">
          No Orders Placed Yet
        </h3>
        <p className="text-xs text-espresso-muted mt-1 max-w-sm mx-auto">
          Explore our handcrafted clay keychains and personalized Keepsakes in the catalog.
        </p>
        <Link
          href="/shop"
          className="inline-block mt-4 px-6 py-2.5 rounded-full bg-strawberry-blush text-on-primary text-xs font-bold hover:opacity-95 shadow-xs transition-all active:scale-95"
        >
          Explore Charm Catalog &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-headline font-bold text-xl text-espresso-deep">
          Commission &amp; Order History
        </h2>
        <p className="text-xs text-espresso-muted mt-0.5">
          Track production progress, courier dispatch notes, and payment status for your keepsakes.
        </p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const statusInfo = formatOrderStatus(order.orderStatus);
          const dateStr = new Date(order.createdAt).toLocaleDateString("en-PK", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={order.id}
              className="p-6 rounded-3xl bg-surface-cloud border border-border-warm/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-strawberry-blush/30 hover:shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-strawberry-blush-dark text-sm">
                    {order.reference}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.badgeClass}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                <div className="text-xs text-espresso-muted flex items-center gap-3">
                  <span>Placed on {dateStr}</span>
                  <span>•</span>
                  <span>
                    {order.items.length} {order.items.length === 1 ? "charm" : "charms"}
                  </span>
                </div>

                <div className="text-xs text-espresso-deep font-medium line-clamp-1">
                  {order.items.map((i) => i.productTitle).join(", ")}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border-warm/50">
                <div className="text-left sm:text-right">
                  <span className="font-headline font-bold text-base text-espresso-deep block">
                    {formatMoney(order.totalMinor)}
                  </span>
                  <span className="text-[10px] text-espresso-muted uppercase font-mono">
                    {order.paymentStatus.replace("_", " ")}
                  </span>
                </div>

                <Link
                  href={`/orders/${order.reference}`}
                  className="px-5 py-2 rounded-full bg-surface-custard border border-border-warm text-espresso-deep font-bold text-xs hover:bg-surface-container transition-all whitespace-nowrap active:scale-95"
                >
                  Track &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

