import React from "react";
import Link from "next/link";
import { getProducts } from "@/lib/catalog/catalog-service";
import { ProductCard } from "@/components/catalog/ProductCard";

interface RelatedProductsProps {
  currentProductId: string;
  categorySlug?: string;
  limit?: number;
}

export async function RelatedProducts({
  currentProductId,
  categorySlug,
  limit = 4,
}: RelatedProductsProps) {
  // First try fetching products from same category
  const { products } = await getProducts({
    categorySlug,
    limit: limit + 2,
  });

  const filtered = products.filter((p) => p.id !== currentProductId).slice(0, limit);

  // If not enough in category, fetch general products
  let displayProducts = filtered;
  if (displayProducts.length < limit) {
    const { products: general } = await getProducts({ limit: limit + 4 });
    const additional = general.filter(
      (p) => p.id !== currentProductId && !displayProducts.some((d) => d.id === p.id)
    );
    displayProducts = [...displayProducts, ...additional].slice(0, limit);
  }

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="pt-16 mt-16 border-t border-border-warm" aria-labelledby="related-charms-heading">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 id="related-charms-heading" className="font-headline font-bold text-2xl text-espresso-deep">
            You Might Also Adore
          </h2>
          <p className="text-xs text-espresso-muted mt-1">
            Complementary artisanal keepsakes and bestselling studio creations.
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs font-bold text-primary hover:underline shrink-0 hidden sm:inline-block"
        >
          View Full Catalog →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

