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
      <div className="py-20 px-6 text-center max-w-md mx-auto bg-surface-cloud rounded-3xl border border-border-warm/50 shadow-sm my-8">
        <div className="w-20 h-20 rounded-full bg-strawberry-subtle text-strawberry-blush flex items-center justify-center text-3xl mx-auto mb-4 shadow-xs">
          🧸
        </div>
        <h3 className="font-headline font-bold text-xl text-espresso-deep mb-2">
          No charms found
        </h3>
        <p className="font-body-sm text-body-sm text-espresso-muted mb-6 leading-relaxed">
          {emptyMessage} Try adjusting your search query, price range, or category filter.
        </p>
        <Link
          href={resetHref}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-strawberry-blush text-on-primary font-bold text-xs hover:opacity-95 transition-all shadow-xs active:scale-95"
        >
          <span>View All Charms</span>
          <Icon name="arrow_forward" className="text-[16px]" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
