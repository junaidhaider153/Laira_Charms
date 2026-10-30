import type { ProductType, StockMode, ProductStatus } from "@/lib/supabase/types";
export type { ProductType, StockMode, ProductStatus };

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface CatalogProductMedia {
  id: string;
  productId: string;
  storagePath: string;
  publicUrl: string;
  altText: string;
  displayOrder: number;
}

export interface CatalogProduct {
  id: string;
  categoryId: string | null;
  categorySlug?: string;
  categoryName?: string;
  slug: string;
  title: string;
  description: string;
  productType: ProductType;
  basePriceMinor: number;
  currency: string;
  status: ProductStatus;
  stockMode: StockMode;
  stockQuantity: number;
  leadTimeDays: number;
  isFeatured: boolean;
  media: CatalogProductMedia[];
  primaryImage: string;
  createdAt: string;
}

export type CatalogSortOption = "newest" | "price_asc" | "price_desc" | "title_asc";

export interface CatalogFilterParams {
  categorySlug?: string;
  query?: string;
  productType?: ProductType;
  minPriceMinor?: number;
  maxPriceMinor?: number;
  sort?: CatalogSortOption;
  limit?: number;
  offset?: number;
}

