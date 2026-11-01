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
          className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all whitespace-nowrap shrink-0 ${
            !currentCategory
              ? "bg-strawberry-blush text-on-primary shadow-xs font-bold"
              : "bg-surface-cloud text-espresso-deep hover:bg-surface-custard border border-border-warm/60 shadow-xs"
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
              className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-strawberry-blush text-on-primary shadow-xs font-bold"
                  : "bg-surface-cloud text-espresso-deep hover:bg-surface-custard border border-border-warm/60 shadow-xs"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Second Row: Filter Badges, Counter, and Sort Selector */}
      <div className="p-4 sm:p-5 rounded-3xl bg-surface-cloud border border-border-warm/50 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Left: Product Type filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider text-espresso-muted mr-1">
            Filter:
          </span>
          <Link
            href={createFilterUrl("type", "")}
            onClick={(e) => {
              e.preventDefault();
              navigateTo(createFilterUrl("type", ""));
            }}
            className={`px-3 py-1 rounded-full text-label-sm font-label-sm font-semibold transition-all ${
              !currentType
                ? "bg-surface-custard text-espresso-deep border border-border-warm/60 font-bold shadow-xs"
                : "text-espresso-muted hover:text-espresso-deep bg-background"
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
            className={`px-3 py-1 rounded-full text-label-sm font-label-sm font-semibold transition-all ${
              currentType === "ready_made"
                ? "bg-matcha-tint text-secondary border border-secondary/20 font-bold shadow-xs"
                : "text-espresso-muted hover:text-espresso-deep bg-background"
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
            className={`px-3 py-1 rounded-full text-label-sm font-label-sm font-semibold transition-all ${
              currentType === "customizable"
                ? "bg-strawberry-subtle text-primary border border-primary/20 font-bold shadow-xs"
                : "text-espresso-muted hover:text-espresso-deep bg-background"
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
            className={`px-3 py-1 rounded-full text-label-sm font-label-sm font-semibold transition-all ${
              currentType === "bespoke_quote"
                ? "bg-peach-tint text-tertiary border border-border-warm font-bold shadow-xs"
                : "text-espresso-muted hover:text-espresso-deep bg-background"
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
              className="ml-2 font-label-sm text-[11px] font-bold text-error hover:underline"
            >
              Clear Filters
            </Link>
          )}
        </div>

        {/* Right: Item Count & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <span className="font-body-sm text-xs font-semibold text-espresso-muted">
            Showing <strong className="text-espresso-deep">{totalProducts}</strong> charms
          </span>

          <div className="flex items-center gap-1.5 bg-surface-custard border border-border-warm/60 rounded-full px-3.5 py-1.5 text-xs text-espresso-deep font-semibold shadow-xs">
            <span className="font-label-sm text-[11px] text-espresso-muted">Sort:</span>
            <select
              value={currentSort}
              onChange={handleSortChange}
              className="bg-transparent border-0 outline-none font-label-sm text-xs font-bold text-espresso-deep cursor-pointer focus:ring-0 p-0 pr-1"
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
