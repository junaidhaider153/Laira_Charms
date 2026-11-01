"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import type { CatalogProduct } from "@/lib/catalog/types";

interface ProductCardProps {
  product: CatalogProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openDrawer } = useCart();
  const [isFavorited, setIsFavorited] = useState(false);

  const isReadyMade = product.productType === "ready_made";
  const isCustomizable = product.productType === "customizable";
  const isBespoke = product.productType === "bespoke_quote";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      basePriceMinor: product.basePriceMinor,
      unitPriceMinor: product.basePriceMinor,
      quantity: 1,
      imageUrl: product.primaryImage,
      leadTimeDays: product.leadTimeDays,
    });
    openDrawer();
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="group relative bg-surface-cloud rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-border-warm/40">
      {/* Whole-card navigation link */}
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-0 rounded-3xl"
        aria-label={`View ${product.title} details`}
      >
        <span className="sr-only">View {product.title}</span>
      </Link>

      <div>
        {/* Image Vitrine Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-surface-custard mb-4">
          {/* Status Badge */}
          <div className="absolute top-3 left-3 z-10">
            {isReadyMade && (
              <span className="inline-flex items-center gap-1 bg-surface-cloud/95 backdrop-blur-sm rounded-full px-3 py-1 font-label-sm text-label-sm text-espresso-deep shadow-xs font-semibold">
                <span>⚡</span> In Stock
              </span>
            )}
            {isCustomizable && (
              <span className="inline-flex items-center gap-1 bg-strawberry-subtle/95 backdrop-blur-sm rounded-full px-3 py-1 font-label-sm text-label-sm text-primary shadow-xs font-semibold">
                <span>✨</span> Customizable
              </span>
            )}
            {isBespoke && (
              <span className="inline-flex items-center gap-1 bg-peach-tint/95 backdrop-blur-sm rounded-full px-3 py-1 font-label-sm text-label-sm text-tertiary shadow-xs font-semibold">
                <span>🎨</span> Bespoke Quote
              </span>
            )}
          </div>

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={toggleFavorite}
            title="Save to lovelist"
            className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-surface-cloud/90 flex items-center justify-center transition-colors shadow-xs ${
              isFavorited ? "text-strawberry-blush" : "text-espresso-muted hover:text-strawberry-blush"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {isFavorited ? "favorite" : "favorite_border"}
            </span>
            <span className="sr-only">Save to lovelist</span>
          </button>

          {/* Product Photography */}
          <img
            src={product.primaryImage}
            alt={product.title}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Lead time pill */}
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface-cloud/90 text-espresso-muted border border-border-warm/40 backdrop-blur-xs shadow-xs">
              {product.leadTimeDays === 1 ? "Next day drop" : `${product.leadTimeDays}d craft`}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="px-1">
          {product.categoryName && (
            <span className="font-label-sm text-[10px] uppercase font-bold tracking-wider text-espresso-muted block mb-1">
              {product.categoryName}
            </span>
          )}
          <h3 className="font-title-md text-title-md text-espresso-deep font-bold mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {product.title}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & Call to Action */}
      <div className="pt-3 px-1 border-t border-border-warm/40 flex items-center justify-between relative z-10">
        <div>
          <span className="font-label-sm text-[10px] text-espresso-muted block leading-none mb-1">
            {isBespoke ? "Starting estimate" : "Studio price"}
          </span>
          <span className="font-headline-sm text-headline-sm text-espresso-deep font-bold">
            {formatMoney(product.basePriceMinor)}
          </span>
        </div>

        <div>
          {isReadyMade ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="inline-flex items-center gap-1.5 rounded-full bg-peach-tint hover:bg-strawberry-blush hover:text-white text-strawberry-blush px-4 py-2 font-label-md text-label-md font-bold transition-all shadow-xs active:scale-95"
            >
              <span>+ Bag</span>
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">add_shopping_cart</span>
              <span className="sr-only"> - Quick add {product.title} to bag</span>
            </button>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-surface-custard text-espresso-deep font-bold text-xs hover:bg-strawberry-blush hover:text-white transition-all border border-border-warm/60 shadow-xs"
            >
              <span>{isCustomizable ? "Customize →" : "Inquire →"}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
