"use client";

import React from "react";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
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
      <div className="py-20 px-4 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-strawberry-subtle text-strawberry-blush flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
          🧸
        </div>
        <h3 className="font-headline font-bold text-xl text-espresso-deep mb-2">
          No charms found
        </h3>
        <p className="text-sm text-espresso-muted mb-6 leading-relaxed">
          {emptyMessage} Try adjusting your search query, price range, or category filter.
        </p>
        <Link
          href={resetHref}
          className="inline-flex items-center px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs hover:bg-opacity-95 transition-all shadow-sm"
        >
          View All Charms
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

