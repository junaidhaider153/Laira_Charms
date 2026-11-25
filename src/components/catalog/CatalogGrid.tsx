"use client";

import React from "react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { Icon } from "@/components/ui/Icon";
import type { CatalogProduct } from "@/lib/catalog/types";

interface CatalogGridProps {
  products: CatalogProduct[];
  emptyMessage?: string;
  resetHref?: string;
}

export function CatalogGrid({
  products,
  emptyMessage = "No charms matched your filter criteria.",
  resetHref = "/shop",
}: CatalogGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 px-6 text-center max-w-md mx-auto bg-[#FFF9F5] rounded-2xl border border-[#2C1E16]/15 shadow-sm my-8">
        <div className="w-16 h-16 rounded-md bg-transparent border border-[#2C1E16]/15 text-[#2C1E16] flex items-center justify-center text-3xl mx-auto mb-4">
          🧸
        </div>
        <h3 className="font-headline font-bold text-xl text-[#2C1E16] mb-2">
          No charms found
        </h3>
        <p className="font-body-sm text-body-sm text-[#2C1E16]/70 mb-6 leading-relaxed">
          {emptyMessage} Try adjusting your search query, price range, or category filter.
        </p>
        <Link
          href={resetHref}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-md bg-[#A62C4B] hover:bg-[#2C1E16] text-[#FFF9F5] font-bold text-xs transition-colors active:scale-95"
        >
          <span>View All Charms</span>
          <Icon name="arrow_forward" className="text-[16px]" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
