"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { Icon } from "@/components/ui/Icon";
import type { CatalogProduct } from "@/lib/catalog/types";

interface ProductCardProps {
  product: CatalogProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openDrawer } = useCart();
  const [isFavorited, setIsFavorited] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

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
    setJustAdded(true);
    openDrawer();
    setTimeout(() => setJustAdded(false), 1800);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="group relative bg-[#FFF9F5] rounded-2xl p-2.5 sm:p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between border border-[#2C1E16]/10">
      {/* Whole-card navigation link */}
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`View ${product.title} details`}
      >
        <span className="sr-only">View {product.title}</span>
      </Link>

      <div>
        {/* Image Vitrine Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-surface-custard mb-3 sm:mb-4">
          {/* Editorial Status Tag */}
          <div className="absolute top-2.5 left-2.5 z-10">
            {isReadyMade && (
              <span className="inline-block rounded-sm bg-[#2C1E16]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FFF9F5]">
                In Stock
              </span>
            )}
            {isCustomizable && (
              <span className="inline-block rounded-sm bg-[#A62C4B]/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#FFF9F5]">
                Customizable
              </span>
            )}
            {isBespoke && (
              <span className="inline-block rounded-sm bg-[#FFF9F5]/95 border border-[#2C1E16]/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#2C1E16]">
                Bespoke Quote
              </span>
            )}
          </div>

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={toggleFavorite}
            title="Save to lovelist"
            className={`absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-md bg-[#FFF9F5]/90 border border-[#2C1E16]/15 flex items-center justify-center transition-colors ${
              isFavorited ? "text-[#A62C4B]" : "text-[#2C1E16]/70 hover:text-[#A62C4B]"
            }`}
          >
            <Icon
              name={isFavorited ? "favorite" : "favorite_border"}
              className="text-[18px]"
              aria-hidden="true"
            />
            <span className="sr-only">Save to lovelist</span>
          </button>

          {/* Product Photography */}
          <img
            src={product.primaryImage}
            alt={product.title}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Lead time tag */}
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-medium bg-[#FFF9F5]/95 text-[#2C1E16] border border-[#2C1E16]/15">
              {product.leadTimeDays ? `${product.leadTimeDays}d lead` : "7–14d craft"}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="px-0.5 sm:px-1">
          {product.categoryName && (
            <span className="font-label-sm text-[10px] uppercase font-bold tracking-wider text-[#2C1E16]/60 block mb-1 truncate">
              {product.categoryName}
            </span>
          )}
          <h3 className="font-title-md text-sm sm:text-title-md text-[#2C1E16] font-bold mb-1 group-hover:text-[#A62C4B] transition-colors line-clamp-1">
            {product.title}
          </h3>
          <p className="font-body-sm text-xs sm:text-body-sm text-[#2C1E16]/70 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & Call to Action */}
      <div className="pt-3 px-0.5 sm:px-1 border-t border-[#2C1E16]/10 flex items-center justify-between gap-2 relative z-10">
        <div className="min-w-0">
          <span className="font-label-sm text-[10px] text-[#2C1E16]/65 block leading-none mb-1 truncate">
            {isBespoke ? "Starting estimate" : "Studio price"}
          </span>
          <span className="font-headline-sm text-base sm:text-headline-sm text-[#2C1E16] font-bold">
            {formatMoney(product.basePriceMinor)}
          </span>
        </div>

        <div className="shrink-0">
          {isReadyMade ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 sm:px-3.5 py-2 text-xs font-semibold transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A62C4B] focus-visible:ring-offset-2 ${
                justAdded
                  ? "bg-[#A62C4B] text-[#FFF9F5]"
                  : "bg-[#2C1E16] hover:bg-[#A62C4B] text-[#FFF9F5]"
              }`}
            >
              <span>{justAdded ? "Added" : "Add"}</span>
              <Icon name={justAdded ? "check" : "add_shopping_cart"} className="text-[15px]" aria-hidden="true" />
              <span className="sr-only"> - Quick add {product.title} to bag</span>
            </button>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-2 rounded-md border border-[#2C1E16]/25 bg-transparent text-[#2C1E16] font-semibold text-xs hover:bg-[#2C1E16] hover:text-[#FFF9F5] transition-colors"
            >
              <span>{isCustomizable ? "Customize →" : "Inquire →"}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
