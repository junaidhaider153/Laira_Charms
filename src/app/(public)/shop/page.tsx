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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Breadcrumbs items={[{ label: "Shop Catalog" }]} />

      {/* Page Header */}
      <div className="mb-8 mt-2">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-espresso-deep">
          Artisanal Charm Catalog
        </h1>
        <p className="text-sm text-espresso-muted mt-2 max-w-2xl leading-relaxed">
          Oven-cured clay keychains, custom stamped initials, and drop-resistant glazed keepsakes handcrafted with care in Pakistan.
        </p>
      </div>

      {/* Filters and Grid wrapped in Suspense for smooth query updates */}
      <Suspense fallback={<div className="py-12 text-center text-xs text-espresso-muted">Loading collection...</div>}>
        <CatalogFilters categories={categories} totalProducts={total} />
        <CatalogGrid products={products} />
      </Suspense>
    </div>
  );
}

