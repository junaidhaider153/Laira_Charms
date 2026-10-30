"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/utils";
import {
  calculateShippingFee,
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

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-peach-tint/60 flex items-center justify-center text-3xl">
          🛍️
        </div>
        <h1 className="font-headline font-bold text-3xl text-espresso-deep mb-3">
          Your Charm Bag is Empty
        </h1>
        <p className="text-espresso-muted max-w-md mx-auto mb-8 text-sm sm:text-base">
          You haven&apos;t added any handcrafted keepsakes yet. Explore our sculpted clay charms,
          custom letter stamps, and bespoke miniatures.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-opacity-95 shadow-md hover:shadow-lg transition-all"
        >
          Explore Handmade Collection &rarr;
        </Link>
      </div>
    );
  }

  const shippingFeeMinor = calculateShippingFee(subtotalMinor);
  const totalMinor = subtotalMinor + shippingFeeMinor;
  const freeShippingRemainingMinor = Math.max(0, FREE_SHIPPING_THRESHOLD_MINOR - subtotalMinor);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotalMinor / FREE_SHIPPING_THRESHOLD_MINOR) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline font-bold text-3xl text-espresso-deep">
            Shopping Bag
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1">
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
      <div className="mb-8 p-4 rounded-2xl bg-surface-custard border border-border-warm shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs sm:text-sm">
          {freeShippingRemainingMinor > 0 ? (
            <p className="text-espresso-deep">
              Add <span className="font-bold text-primary">{formatMoney(freeShippingRemainingMinor)}</span> more to unlock <span className="font-bold">FREE Delivery</span> across Pakistan!
            </p>
          ) : (
            <p className="text-secondary font-bold flex items-center gap-1.5">
              <span>🎉</span> Congratulations! You have unlocked FREE Standard Delivery!
            </p>
          )}
          <span className="text-[11px] font-semibold text-espresso-muted self-end sm:self-auto">
            {freeShippingProgress}% of Rs. 3,000 threshold
          </span>
        </div>
        <div className="w-full bg-surface-cloud h-2.5 rounded-full overflow-hidden border border-border-warm/40">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Line Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const itemTotalMinor = item.unitPriceMinor * item.quantity;
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-surface-custard border border-border-warm flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xs transition-shadow hover:shadow-sm"
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-surface-cloud shrink-0 border border-border-warm/50">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-espresso-muted text-xs">
                      No Image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-headline font-bold text-base sm:text-lg text-espresso-deep hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <span className="font-headline font-bold text-sm sm:text-base text-espresso-deep shrink-0">
                      {formatMoney(itemTotalMinor)}
                    </span>
                  </div>

                  <p className="text-xs text-espresso-muted mt-0.5">
                    Unit Price: {formatMoney(item.unitPriceMinor)}
                  </p>

                  {/* Customization Details */}
                  {(item.customization || item.customText) && (
                    <div className="mt-2.5 p-2 rounded-xl bg-surface-cloud border border-border-warm/50 text-[11px] text-espresso-deep space-y-1">
                      {item.customization &&
                        Object.entries(item.customization).map(([group, val]) => (
                          <div key={group} className="flex items-center gap-1.5">
                            <span className="text-espresso-muted font-medium">{group}:</span>
                            <span className="font-bold">{val}</span>
                          </div>
                        ))}
                      {item.customText && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-espresso-muted font-medium">Stamped Text:</span>
                          <span className="font-mono font-bold uppercase text-primary">
                            &quot;{item.customText}&quot;
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-warm/40">
                    <div className="flex items-center border border-border-warm rounded-full bg-surface-cloud p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-espresso-muted hover:text-espresso-deep hover:bg-surface-custard rounded-full transition-colors text-sm font-bold"
                        aria-label={`Decrease quantity of ${item.title}`}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-espresso-deep">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-espresso-muted hover:text-espresso-deep hover:bg-surface-custard rounded-full transition-colors text-sm font-bold"
                        aria-label={`Increase quantity of ${item.title}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-semibold text-error hover:underline transition-colors"
                      aria-label={`Remove ${item.title} from bag`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-surface-custard border border-border-warm shadow-xs space-y-5 sticky top-24">
          <h2 className="font-headline font-bold text-xl text-espresso-deep border-b border-border-warm pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-espresso-muted">
              <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
              <span className="font-semibold text-espresso-deep">
                {formatMoney(subtotalMinor)}
              </span>
            </div>

            <div className="flex justify-between text-espresso-muted items-center">
              <span>Standard Delivery</span>
              {shippingFeeMinor === 0 ? (
                <span className="font-bold text-secondary text-xs uppercase px-2 py-0.5 rounded-full bg-secondary/10">
                  FREE
                </span>
              ) : (
                <span className="font-semibold text-espresso-deep">
                  {formatMoney(shippingFeeMinor)}
                </span>
              )}
            </div>

            <div className="border-t border-border-warm pt-3 flex justify-between items-baseline">
              <span className="font-headline font-bold text-base text-espresso-deep">
                Estimated Total
              </span>
              <div className="text-right">
                <span className="font-headline font-bold text-2xl text-espresso-deep">
                  {formatMoney(totalMinor)}
                </span>
                <span className="block text-[11px] text-espresso-muted">PKR (Includes all taxes)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-peach-tint/40 border border-border-warm/50 text-xs text-espresso-muted space-y-1">
            <p className="font-semibold text-espresso-deep flex items-center gap-1.5">
              <span>✨</span> Artisan Studio Guarantee
            </p>
            <p className="text-[11px] leading-relaxed">
              Every charm is sculpted and glazed individually by hand. Manual bank &amp; wallet transfers (Meezan, EasyPaisa, JazzCash) accepted.
            </p>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 px-6 rounded-full bg-primary text-white font-bold text-sm text-center block hover:bg-opacity-95 shadow-md hover:shadow-lg transition-all"
          >
            Proceed to Checkout &rarr;
          </Link>

          <Link
            href="/shop"
            className="w-full py-3 px-6 rounded-full bg-surface-cloud border border-border-warm text-espresso-deep font-bold text-xs text-center block hover:bg-surface-container transition-all"
          >
            &larr; Continue Browsing Charms
          </Link>
        </div>
      </div>
    </div>
  );
}
