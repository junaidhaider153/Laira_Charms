"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import {
  calculateShippingFee,
  STANDARD_SHIPPING_FEE_MINOR,
  FREE_SHIPPING_THRESHOLD_MINOR,
} from "@/lib/checkout/shipping";

export function CartView() {
  const {
    items,
    itemCount,
    subtotalMinor,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [shippingPolicy, setShippingPolicy] = useState<{
    standardRateMinor: number;
    freeShippingThresholdMinor: number;
  }>({
    standardRateMinor: STANDARD_SHIPPING_FEE_MINOR,
    freeShippingThresholdMinor: FREE_SHIPPING_THRESHOLD_MINOR,
  });

  useEffect(() => {
    fetch("/api/settings/shipping")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.standardRateMinor === "number") {
          setShippingPolicy({
            standardRateMinor: data.standardRateMinor,
            freeShippingThresholdMinor: data.freeShippingThresholdMinor,
          });
        }
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-strawberry-subtle flex items-center justify-center text-4xl shadow-xs">
          🛍️
        </div>
        <h2 className="font-headline font-bold text-3xl sm:text-4xl text-espresso-deep mb-3">
          Your Charm Bag is Empty
        </h2>
        <p className="font-body-md text-espresso-muted max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
          You haven&apos;t added any handcrafted keepsakes yet. Explore our sculpted clay charms,
          custom letter stamps, and bespoke miniatures.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-strawberry-blush text-on-primary font-bold text-sm hover:opacity-95 shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <span>Explore Handmade Collection</span>
          <Icon name="arrow_forward" className="text-[18px]" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const standardFee = shippingPolicy.standardRateMinor;
  const threshold = shippingPolicy.freeShippingThresholdMinor;
  const shippingFeeMinor = calculateShippingFee(subtotalMinor, {
    standardRateMinor: standardFee,
    freeShippingThresholdMinor: threshold,
  });
  const totalMinor = subtotalMinor + shippingFeeMinor;
  const freeShippingRemainingMinor = threshold > 0 ? Math.max(0, threshold - subtotalMinor) : 0;
  const freeShippingProgress = threshold > 0 ? Math.min(100, Math.round((subtotalMinor / threshold) * 100)) : 100;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline font-bold text-3xl sm:text-4xl text-espresso-deep">
            Shopping Bag
          </h1>
          <p className="font-body-sm text-xs sm:text-sm text-espresso-muted mt-1">
            Review your handmade selections before proceeding to checkout ({itemCount} {itemCount === 1 ? "item" : "items"}).
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-error/80 hover:text-error transition-colors self-start sm:self-auto"
        >
          Clear entire bag
        </button>
      </div>

      {/* Free Shipping Progress Meter */}
      <div className="mb-8 p-5 rounded-3xl bg-surface-custard border border-border-warm shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs sm:text-sm">
          {freeShippingRemainingMinor > 0 ? (
            <p className="text-espresso-deep font-medium">
              Add <span className="font-bold text-strawberry-blush">{formatMoney(freeShippingRemainingMinor)}</span> more to unlock <span className="font-bold">FREE Delivery</span> across Pakistan!
            </p>
          ) : (
            <p className="text-secondary font-bold flex items-center gap-1.5">
              <span>🎉</span> Congratulations! You have unlocked FREE Standard Delivery!
            </p>
          )}
          <span className="text-[11px] font-semibold text-espresso-muted self-end sm:self-auto">
            {freeShippingProgress}% of {formatMoney(threshold)} threshold
          </span>
        </div>
        <div className="w-full bg-surface-cloud h-2.5 rounded-full overflow-hidden border border-border-warm/40 shadow-inner">
          <div
            className="h-full bg-strawberry-blush transition-all duration-500 rounded-full"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Line Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const lineTotalMinor = item.unitPriceMinor * item.quantity;
            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-3xl bg-surface-cloud border border-border-warm/50 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-all"
              >
                <div className="flex gap-4 items-center">
                  <div className="relative w-20 h-20 rounded-2xl bg-surface-custard overflow-hidden border border-border-warm/40 shrink-0 shadow-xs">
                    {item.imageUrl && item.imageUrl.startsWith("http") ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🧸
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="font-headline font-bold text-base sm:text-lg text-espresso-deep">
                      {item.title}
                    </h2>
                    <p className="text-xs font-bold text-strawberry-blush mt-0.5">
                      {formatMoney(item.unitPriceMinor)}
                    </p>

                    {item.customText && (
                      <p className="text-xs text-espresso-muted mt-1">
                        Stamped: <span className="font-bold text-espresso-deep">&quot;{item.customText}&quot;</span>
                      </p>
                    )}

                    {item.customization && Object.keys(item.customization).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {Object.entries(item.customization).map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-sm bg-transparent text-[#2C1E16] border border-[#2C1E16]/20 font-medium"
                          >
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-border-warm/40">
                  <div className="flex items-center border border-border-warm/60 rounded-full bg-surface-custard/60 overflow-hidden shadow-xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-espresso-muted hover:text-espresso-deep hover:bg-surface-custard text-sm font-bold transition-colors"
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      <span aria-hidden="true">−</span>
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-espresso-deep">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-espresso-muted hover:text-espresso-deep hover:bg-surface-custard text-sm font-bold transition-colors"
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <span className="font-headline font-bold text-base text-espresso-deep block">
                      {formatMoney(lineTotalMinor)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-error/80 hover:text-error transition-colors font-medium mt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-surface-cloud p-6 sm:p-8 rounded-3xl border border-border-warm/50 shadow-sm space-y-6 sticky top-28">
          <h2 className="font-headline font-bold text-xl text-espresso-deep pb-4 border-b border-border-warm/50">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-espresso-muted font-medium">
              <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
              <span className="text-espresso-deep font-bold">{formatMoney(subtotalMinor)}</span>
            </div>

            <div className="flex justify-between text-espresso-muted font-medium">
              <span>Shipping Estimate (Pakistan)</span>
              <span>
                {shippingFeeMinor === 0 ? (
                  <span className="font-bold text-secondary">FREE</span>
                ) : (
                  <span className="text-espresso-deep font-bold">{formatMoney(shippingFeeMinor)}</span>
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-border-warm/50 flex justify-between items-baseline">
              <span className="font-headline font-bold text-lg text-espresso-deep">Estimated Total</span>
              <span className="font-headline font-bold text-2xl text-strawberry-blush">
                {formatMoney(totalMinor)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/checkout"
              className="w-full py-4 rounded-full bg-strawberry-blush text-on-primary font-bold text-sm text-center shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <Icon name="lock" className="text-[18px]" aria-hidden="true" />
            </Link>
          </div>

          <div className="pt-2 border-t border-border-warm/40 space-y-2 text-xs text-espresso-muted">
            <div className="flex items-center gap-2">
              <Icon name="verified" className="text-[16px] text-strawberry-blush" aria-hidden="true" />
              <span>Manual Bank Verification (Meezan, EasyPaisa, JazzCash)</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="local_shipping" className="text-[16px] text-strawberry-blush" aria-hidden="true" />
              <span>Nationwide Domestic Couriers (PostEx &amp; TCS)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
