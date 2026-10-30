import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts } from "@/lib/catalog/catalog-service";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found • Laira Charms" };
  }

  return {
    title: `${category.name} • Laira Charms`,
    description: category.description || `Browse ${category.name} at Laira Charms Pakistan.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { products } = await getProducts({ categorySlug: slug });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Breadcrumbs
        items={[
          { label: "Shop", href: "/shop" },
          { label: category.name },
        ]}
      />

      <div className="bg-surface-custard p-8 sm:p-12 rounded-3xl border border-border-warm shadow-xs mb-8 mt-4">
        <span className="text-xs uppercase font-bold tracking-widest text-primary block mb-2">
          Category Collection
        </span>
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-espresso-deep">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-sm text-espresso-muted mt-2 max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      <CatalogGrid
        products={products}
        emptyMessage={`No charms currently listed in ${category.name}. Check back soon or request a custom order!`}
      />
    </div>
  );
}

