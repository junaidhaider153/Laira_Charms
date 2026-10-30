"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { OptionSelector } from "@/components/customization/OptionSelector";
import type { CatalogProduct } from "@/lib/catalog/types";
import type { OptionGroup } from "@/lib/customization/types";

interface ProductInfoProps {
  product: CatalogProduct;
  optionGroups?: OptionGroup[];
}

export function ProductInfo({ product, optionGroups }: ProductInfoProps) {
  const { addItem, openDrawer } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const maxStock = product.stockMode === "tracked" ? Math.max(1, product.stockQuantity) : 99;
  const isOutOfStock = product.stockMode === "tracked" && product.stockQuantity <= 0;

  function handleQuantityChange(delta: number) {
    setQuantity((prev) => Math.min(maxStock, Math.max(1, prev + delta)));
  }

  function handleAddToCart() {
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      basePriceMinor: product.basePriceMinor,
      unitPriceMinor: product.basePriceMinor,
      quantity,
      imageUrl: product.primaryImage,
      leadTimeDays: product.leadTimeDays,
    });

    setIsAdded(true);
    openDrawer();

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  }

  return (
    <div className="space-y-6">
      {/* Category Link & Type Badge */}
      <div className="flex flex-wrap items-center gap-2">
        {product.categorySlug && (
          <Link
            href={`/categories/${product.categorySlug}`}
            className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
          >
            {product.categoryName || "Handmade Keepsakes"}
          </Link>
        )}

        <span className="text-border-warm">•</span>

        {product.productType === "ready_made" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-matcha-tint text-secondary">
            ⚡ Ready-Made In Stock
          </span>
        )}
        {product.productType === "customizable" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-strawberry-subtle text-primary">
            ✏️ Customizable Keepsake
          </span>
        )}
        {product.productType === "bespoke_quote" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-peach-tint text-espresso-deep">
            🎨 Bespoke Commission
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso-deep leading-tight">
        {product.title}
      </h1>

      {/* Pricing Header */}
      <div className="flex items-baseline gap-3">
        {product.productType === "bespoke_quote" ? (
          <div>
            <span className="text-xs text-espresso-muted block mb-0.5">Starting commission estimate:</span>
            <span className="font-headline text-3xl font-bold text-primary">
              {formatMoney(product.basePriceMinor)}
            </span>
          </div>
        ) : (
          <span className="font-headline text-3xl font-bold text-primary">
            {formatMoney(product.basePriceMinor)}
          </span>
        )}
        <span className="text-xs text-espresso-muted font-medium">PKR (incl. craft packaging)</span>
      </div>

      {/* Stock & Studio Lead Time Banner */}
      <div className="p-4 rounded-2xl bg-surface-custard border border-border-warm text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-espresso-deep">
          {product.productType === "ready_made" ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>In Studio: Dispatches in 24 hours across Pakistan</span>
            </>
          ) : product.productType === "customizable" ? (
            <>
              <span>⏱️ Handcrafted to Order:</span>
              <span>{product.leadTimeDays} days sculpting, curing &amp; UV glaze</span>
            </>
          ) : (
            <>
              <span>🎨 Atelier Commission:</span>
              <span>~{product.leadTimeDays} days personalized artisan sculpting</span>
            </>
          )}
        </div>
        <p className="text-espresso-muted">
          {product.stockMode === "tracked"
            ? `${product.stockQuantity} handcrafted units remaining in studio`
            : "Handmade on demand with fresh polymer clay batch"}
        </p>
      </div>

      {/* Description */}
      <div className="prose prose-sm text-espresso-deep/90 leading-relaxed">
        <p>{product.description}</p>
      </div>

      {/* Quantity & CTA Section */}
      <div className="pt-2 space-y-4">
        {product.productType === "ready_made" ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between border border-border-warm rounded-full bg-surface-cloud px-3 py-2 w-full sm:w-36 shrink-0">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1 || isOutOfStock}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-espresso-deep hover:bg-surface-custard disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="font-headline font-bold text-espresso-deep text-sm" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= maxStock || isOutOfStock}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-espresso-deep hover:bg-surface-custard disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Bag Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-3.5 px-8 rounded-full font-bold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center gap-2 ${
                isAdded
                  ? "bg-emerald-600 text-white"
                  : isOutOfStock
                  ? "bg-espresso-muted/30 text-espresso-muted cursor-not-allowed"
                  : "bg-primary hover:bg-opacity-95 text-white active:scale-98"
              }`}
            >
              {isAdded ? (
                <>✓ Added to Shopping Bag</>
              ) : isOutOfStock ? (
                <>Out of Stock</>
              ) : (
                <>🛍️ Add to Bag • {formatMoney(product.basePriceMinor * quantity)}</>
              )}
            </button>
          </div>
        ) : product.productType === "customizable" ? (
          optionGroups && optionGroups.length > 0 ? (
            <OptionSelector product={product} groups={optionGroups} />
          ) : (
            <div className="space-y-3">
              <Link
                href={`/shop?type=customizable#custom-options`}
                className="w-full py-3.5 px-8 rounded-full bg-primary hover:bg-opacity-95 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                ✏️ Personalize This Keepsake
              </Link>
              <p className="text-[11px] text-center text-espresso-muted">
                Choose your custom lettering, pastel color palette, and hardware accents.
              </p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            <Link
              href={`/custom-order?ref=${product.slug}`}
              className="w-full py-3.5 px-8 rounded-full bg-espresso-deep hover:bg-opacity-90 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              🎨 Request Custom Commission Quote
            </Link>
            <p className="text-[11px] text-center text-espresso-muted">
              Upload reference sketches or pet photos for bespoke hand-sculpted miniature art.
            </p>
          </div>
        )}
      </div>

      {/* Artisanal Quality & Care Guarantee Card */}
      <div className="pt-4 border-t border-border-warm space-y-3">
        <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-espresso-deep">
          Studio Craftsmanship &amp; Care
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-espresso-muted">
          <li className="flex items-start gap-2">
            <span className="text-strawberry-blush text-sm">✨</span>
            <span>
              <strong className="text-espresso-deep block">Triple UV Diamond Glaze</strong>
              High-gloss glass finish, drop-resistant &amp; scratch-cured.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-strawberry-blush text-sm">💧</span>
            <span>
              <strong className="text-espresso-deep block">Water-Resistant Clay</strong>
              Withstands rain and everyday splashes. Wipe clean gently.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-strawberry-blush text-sm">🇵🇰</span>
            <span>
              <strong className="text-espresso-deep block">Handcrafted in Pakistan</strong>
              Every piece sculpted by hand in our studio with love.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-strawberry-blush text-sm">📦</span>
            <span>
              <strong className="text-espresso-deep block">Gift Presentation</strong>
              Arrives in boutique keepsake box with handwritten card.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
