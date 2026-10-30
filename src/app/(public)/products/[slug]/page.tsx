import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog/catalog-service";
import { ProductMediaGallery } from "@/components/product/ProductMediaGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Charm Not Found • Laira Charms",
      description: "The requested handmade charm could not be located in our atelier catalog.",
    };
  }

  return {
    title: `${product.title} • Laira Charms Pakistan`,
    description: product.description,
    openGraph: {
      title: `${product.title} • Laira Charms`,
      description: product.description,
      images: [
        {
          url: product.primaryImage,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Shop", href: "/shop" },
    ...(product.categorySlug
      ? [
          {
            label: product.categoryName || "Category",
            href: `/categories/${product.categorySlug}`,
          },
        ]
      : []),
    { label: product.title },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Breadcrumbs items={breadcrumbItems} />

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 pt-6">
        {/* Left Column: Artisanal Media Gallery with Thumbnails & Zoom Lightbox */}
        <section aria-label="Product Media Gallery">
          <ProductMediaGallery media={product.media} title={product.title} />
        </section>

        {/* Right Column: Pricing, Artisan Lead Time, Customization & Actions */}
        <section aria-label="Product Details and Purchase Options">
          <ProductInfo product={product} />
        </section>
      </main>

      {/* Related Studio Keepsakes */}
      <RelatedProducts
        currentProductId={product.id}
        categorySlug={product.categorySlug}
        limit={4}
      />
    </div>
  );
}

