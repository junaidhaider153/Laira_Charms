import { Suspense } from "react";
import { getCategories, getProducts } from "@/lib/catalog/catalog-service";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { CatalogSortOption, ProductType } from "@/lib/catalog/types";

export const metadata = {
  title: "Shop Handcrafted Charms • Laira Charms",
  description: "Browse in-stock clay keychains, customized nameplates, and bespoke handcrafted accessories.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    type?: string;
    sort?: string;
    q?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  const categories = await getCategories();

  const { products, total } = await getProducts({
    categorySlug: resolvedParams.category,
    productType: resolvedParams.type as ProductType | undefined,
    sort: (resolvedParams.sort as CatalogSortOption) || "newest",
    query: resolvedParams.q,
  });

  return (
    <div className="w-full bg-background min-h-screen pt-6 sm:pt-8 pb-16">
      {/* Page Header Banner */}
      <div className="w-full bg-surface-custard border-b border-border-warm py-8 sm:py-12 mb-8">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <Breadcrumbs items={[{ label: "Shop Catalog" }]} />
          <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-[#A62C4B] mb-2">
                Small Batch Atelier Drops
              </span>
              <h1 className="font-headline text-3xl sm:text-headline-lg text-[#2C1E16] font-bold tracking-tight">
                Artisanal Charm Catalog
              </h1>
              <p className="font-body-md text-body-md text-[#2C1E16]/75 mt-2 max-w-2xl leading-relaxed">
                Oven-cured polymer charms, custom stamped initials, and drop-resistant glazed keepsakes handcrafted with care in Pakistan.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#2C1E16]">
              <span className="inline-flex items-center gap-1.5 border border-[#2C1E16]/15 rounded-sm bg-[#FFF9F5] px-3 py-1">
                Triple Diamond UV Glaze
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <Suspense fallback={<div className="py-12 text-center text-xs text-espresso-muted">Loading collection...</div>}>
          <CatalogFilters categories={categories} totalProducts={total} />
          <CatalogGrid products={products} />
        </Suspense>
      </div>
    </div>
  );
}
