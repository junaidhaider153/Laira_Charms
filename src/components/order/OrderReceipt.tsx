"use client";

import React from "react";
import { formatMoney } from "@/lib/utils";
import type { Order } from "@/lib/checkout/types";

interface OrderReceiptProps {
  order: Order;
}

export function OrderReceipt({ order }: OrderReceiptProps) {
  const address = order.shippingAddressSnapshot;
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="rounded-3xl bg-surface-cloud border border-border-warm/60 p-6 sm:p-8 shadow-sm print:p-0 print:border-none print:shadow-none">
      {/* Top Action Bar (hidden during printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-warm/60 print:hidden">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Official Document
          </span>
          <h3 className="font-headline font-bold text-xl text-espresso-deep">
            Official Customer Sales Receipt
          </h3>
          <p className="text-xs text-espresso-muted">
            Issued in compliance with Section 19 of the Punjab Consumer Protection Act 2005.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-surface-container border border-border-warm text-espresso-deep font-bold text-xs hover:bg-surface-high transition-all active:scale-95 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <svg
            className="w-4 h-4 text-espresso-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print / Save Receipt
        </button>
      </div>

      {/* Printable Receipt Body */}
      <div className="pt-6 space-y-6">
        {/* Header: Seller & Order Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-border-warm/40">
          <div>
            <div className="font-headline font-bold text-lg text-espresso-deep">
              Laira Charms
            </div>
            <p className="text-xs text-primary font-medium">Artisanal Handcrafted Keepsakes</p>
            <p className="text-xs text-espresso-muted mt-1 leading-relaxed">
              Proprietor / Studio Workshop
              <br />
              Rawalpindi / Islamabad, Punjab, Pakistan
              <br />
              Email: lairacharmsofficial@gmail.com
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <div className="inline-block px-3 py-1 rounded-lg bg-canvas-butter border border-border-warm text-xs font-mono font-bold text-espresso-deep">
              Order #{order.reference}
            </div>
            <p className="text-xs text-espresso-muted">Date: {formattedDate}</p>
            <p className="text-xs text-espresso-muted">
              Payment Status:{" "}
              <span className="font-semibold text-espresso-deep capitalize">
                {order.paymentStatus.replace("_", " ")}
              </span>
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-border-warm/40 text-xs">
          <div>
            <h4 className="font-bold text-espresso-deep uppercase tracking-wider text-[11px] mb-1.5">
              Billed &amp; Shipped To:
            </h4>
            <p className="font-semibold text-espresso-deep">{address.fullName}</p>
            <p className="text-espresso-muted">{address.phone}</p>
            <p className="text-espresso-muted">{address.email}</p>
          </div>

          <div className="sm:text-right">
            <h4 className="font-bold text-espresso-deep uppercase tracking-wider text-[11px] mb-1.5">
              Delivery Address:
            </h4>
            <p className="text-espresso-deep">
              {address.streetAddress}
              <br />
              {address.city}, {address.province} {address.postalCode}
            </p>
            <p className="text-espresso-muted text-[11px] mt-1">
              Authorized Couriers: PostEx / TCS
            </p>
          </div>
        </div>

        {/* Goods / Items Table (Section 19: Date, Goods, Quantity, Price) */}
        <div>
          <h4 className="font-bold text-espresso-deep uppercase tracking-wider text-[11px] mb-3">
            Particulars of Goods Sold:
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-warm text-espresso-muted">
                  <th className="py-2.5 font-semibold">Item &amp; Description</th>
                  <th className="py-2.5 font-semibold text-center w-16">Qty</th>
                  <th className="py-2.5 font-semibold text-right w-24">Unit Price</th>
                  <th className="py-2.5 font-semibold text-right w-28">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-warm/40">
                {order.items.map((item) => (
                  <tr key={item.id} className="text-espresso-deep">
                    <td className="py-3">
                      <div className="font-semibold">{item.productTitle}</div>
                      {item.customizationSnapshot?.customText && (
                        <div className="text-[11px] text-espresso-muted">
                          Stamped: &ldquo;{item.customizationSnapshot.customText}&rdquo;
                        </div>
                      )}
                      {item.customizationSnapshot?.customization && (
                        <div className="text-[11px] text-espresso-muted">
                          {Object.entries(item.customizationSnapshot.customization).map(([k, v]) => (
                            <span key={k} className="mr-2">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">{formatMoney(item.unitPriceMinor)}</td>
                    <td className="py-3 text-right font-semibold">
                      {formatMoney(item.totalMinor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="pt-4 border-t border-border-warm flex justify-end text-xs">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-espresso-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-espresso-deep">
                {formatMoney(order.subtotalMinor)}
              </span>
            </div>
            <div className="flex justify-between text-espresso-muted">
              <span>Delivery Charges</span>
              <span className="font-semibold text-espresso-deep">
                {order.shippingMinor === 0 ? "FREE" : formatMoney(order.shippingMinor)}
              </span>
            </div>
            <div className="pt-2 border-t border-border-warm flex justify-between font-bold text-sm text-espresso-deep">
              <span>Grand Total</span>
              <span className="text-strawberry-blush-dark font-headline text-base">
                {formatMoney(order.totalMinor)}
              </span>
            </div>
          </div>
        </div>

        {/* Statutory Consumer Disclosures */}
        <div className="pt-6 border-t border-border-warm/60 text-[11px] text-espresso-muted leading-relaxed space-y-1.5 bg-canvas-butter/50 p-4 rounded-2xl">
          <p className="font-semibold text-espresso-deep">
            Consumer Information &amp; Policy Notice (Punjab Consumer Protection Act 2005)
          </p>
          <p>
            1. <strong>Final Sale:</strong> Each piece is bespoke and handcrafted to order. Under Section 20, returns or exchanges for change of mind are not accepted once crafting commences.
          </p>
          <p>
            2. <strong>Transit Protection &amp; Defect Liability:</strong> Under Section 12, liability for transit damage is honored. If an item arrives damaged or defective, please submit an unboxing photograph/video to <em>lairacharmsofficial@gmail.com</em> within 48 hours of parcel delivery for a complimentary replacement.
          </p>
          <p>
            3. <strong>Production &amp; Dispatch:</strong> Standard crafting lead time is 7–14 business days. Delivered securely via tracked courier (PostEx / TCS).
          </p>
        </div>
      </div>
    </div>
  );
}
