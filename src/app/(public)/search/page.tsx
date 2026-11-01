import { Suspense } from "react";
import { getProducts } from "@/lib/catalog/catalog-service";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata = {
  title: "Search Results • Laira Charms",
  description: "Search handcrafted charms and clay keychains.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  const { products, total } = await getProducts({
    query,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Breadcrumbs items={[{ label: "Search Results" }]} />

      <div className="mb-8 mt-2">
        <h1 className="font-headline text-3xl font-bold text-espresso-deep">
          Search Results
        </h1>

        {query ? (
          <p className="text-sm text-espresso-muted mt-2">
            Found <strong className="text-espresso-deep">{total}</strong> results matching &quot;{query}&quot;
          </p>
        ) : (
          <p className="text-sm text-espresso-muted mt-2">
            Showing all handcrafted items in the workshop.
          </p>
        )}

        {/* Search Refinement Form */}
        <form
          action="/search"
          method="GET"
          className="mt-4 max-w-md flex items-center bg-surface-cloud rounded-full px-4 py-2 border border-border-warm/60 shadow-xs focus-within:ring-2 focus-within:ring-strawberry-blush/30 transition-all"
        >
          <span className="text-sm mr-2 text-espresso-muted">🔍</span>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name, charm style or material..."
            className="w-full bg-transparent border-0 outline-none text-xs text-espresso-deep placeholder:text-espresso-muted/60"
            aria-label="Search query"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-strawberry-blush text-on-primary text-xs font-bold shrink-0 hover:opacity-95 shadow-xs transition-all active:scale-95"
          >
            Search
          </button>
        </form>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-xs text-espresso-muted">Searching workshop...</div>}>
        <CatalogGrid
          products={products}
          emptyMessage={`We couldn't find any charms matching "${query}".`}
          resetHref="/shop"
        />
      </Suspense>
    </div>
  );
}

