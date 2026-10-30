"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD_MINOR = 300000; // Rs. 3,000 in paisa

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotalMinor,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press and trap focus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    }

    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const freeShippingRemainingMinor = Math.max(0, FREE_SHIPPING_THRESHOLD_MINOR - subtotalMinor);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotalMinor / FREE_SHIPPING_THRESHOLD_MINOR) * 100)
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-espresso-deep/40 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-canvas-butter shadow-2xl flex flex-col border-l border-border-warm"
        >
          {/* Header */}
          <div className="p-6 bg-surface-custard border-b border-border-warm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <h2 className="font-headline font-bold text-xl text-espresso-deep">
                Your Charm Bag ({itemCount})
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="w-9 h-9 rounded-full bg-surface-cloud text-espresso-muted hover:text-espresso-deep hover:bg-surface-container flex items-center justify-center transition-colors"
              aria-label="Close Shopping Bag"
            >
              ✕
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-6 py-3 bg-peach-tint/60 border-b border-border-warm/50 text-xs">
            {freeShippingRemainingMinor > 0 ? (
              <p className="text-espresso-muted mb-1.5 font-medium">
                Add <span className="font-bold text-primary">{formatMoney(freeShippingRemainingMinor)}</span> more for <span className="font-bold text-espresso-deep">Free Delivery</span> across Pakistan!
              </p>
            ) : (
              <p className="text-secondary font-bold mb-1.5 flex items-center gap-1.5">
                <span>🎉</span> You unlocked Free Standard Delivery!
              </p>
            )}
            <div className="w-full bg-surface-cloud h-2 rounded-full overflow-hidden border border-border-warm/30">
              <div
                className="bg-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List / Empty State */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-strawberry-subtle flex items-center justify-center text-3xl mb-4">
                  🧸
                </div>
                <h3 className="font-headline font-bold text-lg text-espresso-deep mb-2">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-espresso-muted max-w-xs mb-6">
                  Explore our handcrafted keepsakes, customized nameplates, and clay keychains.
                </p>
                <Link
                  href="/shop"
                  onClick={closeDrawer}
                  className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs hover:bg-opacity-95 transition-all shadow-sm"
                >
                  Explore Charms
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-surface-cloud border border-border-warm shadow-sm flex gap-4 items-start"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-surface-custard border border-border-warm/60 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                    {item.imageUrl && item.imageUrl.startsWith("http") ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>✨</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline font-bold text-sm text-espresso-deep truncate">
                      {item.title}
                    </h4>
                    <p className="font-bold text-xs text-primary mt-0.5">
                      {formatMoney(item.unitPriceMinor)}
                    </p>

                    {item.customText && (
                      <p className="text-[11px] text-espresso-muted mt-1 truncate">
                        Custom Text: <span className="font-medium text-espresso-deep">&quot;{item.customText}&quot;</span>
                      </p>
                    )}

                    {item.customization && Object.keys(item.customization).length > 0 && (
                      <div className="text-[11px] text-espresso-muted mt-0.5 space-y-0.5">
                        {Object.entries(item.customization).map(([k, v]) => (
                          <span key={k} className="inline-block mr-2">
                            {k}: <span className="font-medium text-espresso-deep">{v}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border-warm rounded-full bg-surface-cloud overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-espresso-muted hover:text-espresso-deep hover:bg-surface-custard transition-colors text-xs font-bold"
                          aria-label={`Decrease quantity of ${item.title}`}
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-espresso-deep">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-espresso-muted hover:text-espresso-deep hover:bg-surface-custard transition-colors text-xs font-bold"
                          aria-label={`Increase quantity of ${item.title}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] font-semibold text-error hover:underline"
                        aria-label={`Remove ${item.title} from bag`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 bg-surface-custard border-t border-border-warm space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-espresso-muted">Subtotal</span>
                <span className="font-headline font-bold text-lg text-espresso-deep">
                  {formatMoney(subtotalMinor)}
                </span>
              </div>
              <p className="text-[11px] text-espresso-muted leading-tight">
                Taxes &amp; delivery calculated at checkout. Manual bank/wallet transfers supported.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="w-full py-3 px-4 rounded-full bg-surface-cloud border border-border-warm text-espresso-deep font-bold text-xs text-center hover:bg-surface-container transition-all"
                >
                  View Full Bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="w-full py-3 px-4 rounded-full bg-primary text-white font-bold text-xs text-center hover:bg-opacity-95 transition-all shadow-sm"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
