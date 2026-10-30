"use client";

import React from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import type { CatalogProduct } from "@/lib/catalog/types";

interface ProductCardProps {
  product: CatalogProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

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
  };

  return (
    <div className="group relative bg-surface-cloud rounded-3xl border border-border-warm shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Whole-card navigation link */}
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-0"
        aria-label={`View ${product.title} details`}
      >
        <span className="sr-only">View {product.title}</span>
      </Link>

      {/* Image Container with Badges */}
      <div className="relative aspect-square w-full bg-surface-custard overflow-hidden">
        {/* Product Type Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isReadyMade && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-matcha-tint text-secondary border border-secondary/20 shadow-xs">
              <span>⚡</span> In Stock
            </span>
          )}
          {isCustomizable && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-strawberry-subtle text-primary border border-primary/20 shadow-xs">
              <span>✏️</span> Customizable
            </span>
          )}
          {isBespoke && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-peach-tint text-espresso-deep border border-border-warm shadow-xs">
              <span>🎨</span> Bespoke Quote
            </span>
          )}
        </div>

        {/* Lead time badge */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-surface-cloud/90 text-espresso-muted border border-border-warm/50 backdrop-blur-xs">
            {product.leadTimeDays === 1 ? "Dispatches next day" : `${product.leadTimeDays}d craft time`}
          </span>
        </div>

        {/* Product Photography */}
        <img
          src={product.primaryImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </div>

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between relative z-10 pointer-events-none">
        <div>
          {product.categoryName && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-espresso-muted block mb-1">
              {product.categoryName}
            </span>
          )}
          <h3 className="font-headline font-bold text-base text-espresso-deep group-hover:text-primary transition-colors line-clamp-1">
            {product.title}
          </h3>
          <p className="text-xs text-espresso-muted mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border-warm/50 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-espresso-muted block leading-none">
              {isBespoke ? "Starting estimate" : "Price"}
            </span>
            <span className="font-headline font-bold text-base text-espresso-deep">
              {formatMoney(product.basePriceMinor)}
            </span>
          </div>

          {/* Action button */}
          <div className="pointer-events-auto">
            {isReadyMade ? (
              <button
                onClick={handleQuickAdd}
                className="px-4 py-2 rounded-full bg-strawberry-blush text-white font-bold text-xs hover:bg-opacity-95 transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                aria-label={`Quick add ${product.title} to bag`}
              >
                <span>+ Bag</span>
              </button>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full bg-surface-custard text-espresso-deep font-semibold text-xs border border-border-warm/80 group-hover:bg-primary group-hover:text-white transition-colors">
                {isCustomizable ? "Customize →" : "Inquire →"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

