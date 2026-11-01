"use client";

import React from "react";
import Link from "next/link";
import type { Order } from "@/lib/checkout/types";
import { formatMoney } from "@/lib/utils";
import { formatOrderStatus } from "@/lib/order/lifecycle";

interface AdminOrderTableProps {
  orders: Order[];
}

export function AdminOrderTable({ orders }: AdminOrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-surface-custard border border-border-warm space-y-3">
        <span className="text-3xl block">📋</span>
        <h3 className="font-headline font-bold text-lg text-espresso-deep">
          No Orders Found in This Queue
        </h3>
        <p className="text-xs text-espresso-muted max-w-sm mx-auto">
          No orders match the selected status filter or search query. Try switching queue tabs.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-border-warm/60 bg-surface-cloud shadow-sm">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border-warm bg-surface-custard/60 text-espresso-muted font-bold">
            <th className="py-3.5 px-4">Order Ref</th>
            <th className="py-3.5 px-4">Date</th>
            <th className="py-3.5 px-4">Customer</th>
            <th className="py-3.5 px-4">City</th>
            <th className="py-3.5 px-4">Items</th>
            <th className="py-3.5 px-4">Total</th>
            <th className="py-3.5 px-4">Payment</th>
            <th className="py-3.5 px-4">Order Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-warm/60">
          {orders.map((order) => {
            const formatted = formatOrderStatus(order.orderStatus);
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-PK", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <tr
                key={order.id}
                className="hover:bg-canvas-butter/60 transition-colors"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-strawberry-blush-dark whitespace-nowrap">
                  {order.reference}
                </td>
                <td className="py-3.5 px-4 text-espresso-muted whitespace-nowrap">
                  {dateStr}
                </td>
                <td className="py-3.5 px-4 font-medium text-espresso-deep">
                  <div className="font-bold">{order.shippingAddressSnapshot.fullName}</div>
                  <div className="text-[11px] text-espresso-muted">
                    {order.shippingAddressSnapshot.phone}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-espresso-deep">
                  <div>{order.shippingAddressSnapshot.city}</div>
                  <div className="text-[11px] text-espresso-muted">
                    {order.shippingAddressSnapshot.province}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-espresso-deep">
                  {order.items.length} {order.items.length === 1 ? "charm" : "charms"}
                </td>
                <td className="py-3.5 px-4 font-bold text-espresso-deep whitespace-nowrap">
                  {formatMoney(order.totalMinor)}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.paymentStatus === "verified"
                        ? "bg-matcha-tint text-matcha-soft border border-matcha-soft/20"
                        : order.paymentStatus === "verification_pending"
                        ? "bg-peach-tint text-strawberry-blush-dark border border-strawberry-blush/20"
                        : order.paymentStatus === "rejected"
                        ? "bg-error/15 text-error border border-error/20"
                        : "bg-surface-custard text-espresso-muted"
                    }`}
                  >
                    {order.paymentStatus.replace("_", " ")}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${formatted.badgeClass}`}
                  >
                    {formatted.label}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/orders/${order.reference}`}
                    className="inline-flex items-center px-4 py-1.5 rounded-full bg-surface-custard border border-border-warm text-espresso-deep font-bold text-xs hover:bg-surface-container transition-all active:scale-95"
                  >
                    Manage &rarr;
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

