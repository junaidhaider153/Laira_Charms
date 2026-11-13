import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog/catalog-service";
import { getOptionGroupsForProduct } from "@/lib/customization/service";
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lairacharms.pk";
  const canonicalUrl = `${baseUrl}/products/${slug}`;
  const priceFormatted = `PKR ${(product.basePriceMinor / 100).toLocaleString()}`;

  return {
    title: `${product.title} • Laira Charms Pakistan`,
    description: `${product.description} Handcrafted in Pakistan. Price: ${priceFormatted}.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.title} • Laira Charms Pakistan`,
      description: product.description,
      url: canonicalUrl,
      siteName: "Laira Charms",
      type: "website",
      locale: "en_PK",
      images: [
        {
          url: product.primaryImage,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} • Laira Charms`,
      description: product.description,
      images: [product.primaryImage],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const optionGroups = product.productType === "customizable"
    ? await getOptionGroupsForProduct(product.id)
    : [];

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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lairacharms.pk";
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.media.map((m) => m.publicUrl),
    brand: {
      "@type": "Brand",
      name: "Laira Charms",
    },
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: "PKR",
      price: (product.basePriceMinor / 100).toFixed(2),
      availability:
        product.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Product Schema JSON-LD for Search Engines & Instagram crawler */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <Breadcrumbs items={breadcrumbItems} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 pt-6">
        {/* Left Column: Artisanal Media Gallery with Thumbnails & Zoom Lightbox */}
        <section aria-label="Product Media Gallery">
          <ProductMediaGallery media={product.media} title={product.title} />
        </section>

        {/* Right Column: Pricing, Artisan Lead Time, Customization & Actions */}
        <section aria-label="Product Details and Purchase Options">
          <ProductInfo product={product} optionGroups={optionGroups} />
        </section>
      </div>

      {/* Related Studio Keepsakes */}
      <RelatedProducts
        currentProductId={product.id}
        categorySlug={product.categorySlug}
        limit={4}
      />
    </div>
  );
}
