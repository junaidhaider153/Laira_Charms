"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { CatalogCategory } from "@/lib/catalog/types";

interface CatalogFiltersProps {
  categories: CatalogCategory[];
  totalProducts: number;
}

export function CatalogFilters({ categories, totalProducts }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentType = searchParams.get("type") || "";

  const hasActiveFilters = Boolean(
    currentCategory || currentType || (currentSort && currentSort !== "newest")
  );

  function createFilterUrl(param: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(param, value);
    } else {
      params.delete(param);
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function navigateTo(url: string) {
    router.push(url, { scroll: false });
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    navigateTo(createFilterUrl("sort", e.target.value));
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Category Pills Rail */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href={createFilterUrl("category", "")}
          onClick={(e) => {
            e.preventDefault();
            navigateTo(createFilterUrl("category", ""));
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            !currentCategory
              ? "bg-primary text-white shadow-xs"
              : "bg-surface-cloud text-espresso-muted hover:text-espresso-deep border border-border-warm"
          }`}
        >
          All Keepsakes
        </Link>

        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          const url = createFilterUrl("category", isActive ? "" : cat.slug);
          return (
            <Link
              key={cat.slug}
              href={url}
              onClick={(e) => {
                e.preventDefault();
                navigateTo(url);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-cloud text-espresso-muted hover:text-espresso-deep border border-border-warm"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Second Row: Filters, Count, and Sort Selector */}
      <div className="p-4 rounded-2xl bg-surface-cloud border border-border-warm shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Product Type filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-espresso-muted mr-1">
            Filter:
          </span>
          <Link
            href={createFilterUrl("type", "")}
            onClick={(e) => {
              e.preventDefault();
              navigateTo(createFilterUrl("type", ""));
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              !currentType
                ? "bg-surface-custard text-espresso-deep font-bold"
                : "text-espresso-muted hover:text-espresso-deep"
            }`}
          >
            All
          </Link>
          <Link
            href={createFilterUrl("type", "ready_made")}
            onClick={(e) => {
              e.preventDefault();
              navigateTo(createFilterUrl("type", "ready_made"));
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              currentType === "ready_made"
                ? "bg-matcha-tint text-secondary font-bold"
                : "text-espresso-muted hover:text-espresso-deep"
            }`}
          >
            In Stock (Ready)
          </Link>
          <Link
            href={createFilterUrl("type", "customizable")}
            onClick={(e) => {
              e.preventDefault();
              navigateTo(createFilterUrl("type", "customizable"));
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              currentType === "customizable"
                ? "bg-strawberry-subtle text-primary font-bold"
                : "text-espresso-muted hover:text-espresso-deep"
            }`}
          >
            Personalized
          </Link>
          <Link
            href={createFilterUrl("type", "bespoke_quote")}
            onClick={(e) => {
              e.preventDefault();
              navigateTo(createFilterUrl("type", "bespoke_quote"));
            }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              currentType === "bespoke_quote"
                ? "bg-peach-tint text-espresso-deep font-bold"
                : "text-espresso-muted hover:text-espresso-deep"
            }`}
          >
            Bespoke Atelier
          </Link>

          {hasActiveFilters && (
            <Link
              href={pathname}
              onClick={(e) => {
                e.preventDefault();
                navigateTo(pathname);
              }}
              className="ml-2 text-[11px] font-bold text-error hover:underline"
            >
              Clear Filters
            </Link>
          )}
        </div>

        {/* Right: Item Count & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-espresso-muted">
            Showing <strong className="text-espresso-deep">{totalProducts}</strong> charms
          </span>

          <div className="flex items-center gap-1.5 bg-surface-custard border border-border-warm/60 rounded-full px-3 py-1.5 text-xs text-espresso-deep font-semibold">
            <span className="text-[11px] text-espresso-muted">Sort:</span>
            <select
              value={currentSort}
              onChange={handleSortChange}
              className="bg-transparent border-0 outline-none text-xs font-bold text-espresso-deep cursor-pointer focus:ring-0 p-0 pr-1"
              aria-label="Sort catalog products"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="title_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
