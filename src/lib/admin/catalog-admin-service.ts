import { FIXTURE_CATEGORIES, FIXTURE_PRODUCTS } from "@/lib/catalog/fixtures";
import type { CatalogCategory, CatalogProduct, ProductStatus } from "@/lib/catalog/types";

function isLiveSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes("dummy-project") || url.includes("example.com")) {
    return false;
  }
  return true;
}

interface GenericSupabaseTable {
  insert: (row: unknown) => {
    select: (cols: string) => {
      single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
    };
  };
  update: (row: unknown) => {
    eq: (col: string, val: string) => Promise<{ error: unknown }>;
  };
  delete: () => {
    eq: (col: string, val: string) => Promise<{ error: unknown }>;
  };
}

interface GenericSupabaseClient {
  from: (table: string) => GenericSupabaseTable;
}

function getGenericClient(supabase: unknown): GenericSupabaseClient {
  return supabase as unknown as GenericSupabaseClient;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const MEMORY_ADMIN_PRODUCTS: Map<string, CatalogProduct> = new Map();
export const MEMORY_ADMIN_CATEGORIES: Map<string, CatalogCategory> = new Map();

// Initialize memory stores from fixtures
FIXTURE_PRODUCTS.forEach((prod) => {
  MEMORY_ADMIN_PRODUCTS.set(prod.id, { ...prod });
});

FIXTURE_CATEGORIES.forEach((cat) => {
  MEMORY_ADMIN_CATEGORIES.set(cat.id, { ...cat });
});

export interface CreateProductInput {
  title: string;
  slug?: string;
  description: string;
  categoryId?: string | null;
  productType?: CatalogProduct["productType"];
  basePriceMinor: number;
  stockMode?: CatalogProduct["stockMode"];
  stockQuantity: number;
  leadTimeDays?: number;
  isFeatured?: boolean;
  status?: ProductStatus;
  primaryImage?: string;
  mediaUrls?: string[];
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

/**
 * Lists all categories for administrative catalog management.
 */
export async function listAdminCategories(): Promise<CatalogCategory[]> {
  if (MEMORY_ADMIN_CATEGORIES.size === 0) {
    FIXTURE_CATEGORIES.forEach((cat) => MEMORY_ADMIN_CATEGORIES.set(cat.id, { ...cat }));
  }

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("categories")
        .select("id, slug, name, description, image_url, sort_order")
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        const liveList: CatalogCategory[] = data.map((c: { id: string; slug: string; name: string; description: string | null; image_url: string | null; sort_order: number }) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description,
          imageUrl: c.image_url,
          sortOrder: c.sort_order,
        }));
        liveList.forEach((cat) => MEMORY_ADMIN_CATEGORIES.set(cat.id, cat));
        return liveList;
      }
    } catch {
      // Fall back to memory cache
    }
  }

  return Array.from(MEMORY_ADMIN_CATEGORIES.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Creates a new category.
 */
export async function createAdminCategory(input: CreateCategoryInput): Promise<CatalogCategory> {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Category name is required.");
  }
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(name);
  const id = `cat-${Date.now()}`;
  const sortOrder = input.sortOrder ?? (MEMORY_ADMIN_CATEGORIES.size + 1);

  const category: CatalogCategory = {
    id,
    slug,
    name,
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || "/images/placeholder.jpg",
    sortOrder,
  };

  MEMORY_ADMIN_CATEGORIES.set(id, category);

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const categoriesTable = getGenericClient(supabase).from("categories");
      const { data, error } = await categoriesTable
        .insert({
          slug,
          name,
          description: category.description,
          image_url: category.imageUrl,
          sort_order: sortOrder,
          is_published: true,
        })
        .select("id, slug, name, description, image_url, sort_order")
        .single();

      if (!error && data) {
        category.id = data.id;
        MEMORY_ADMIN_CATEGORIES.delete(id);
        MEMORY_ADMIN_CATEGORIES.set(data.id, category);
      }
    } catch {
      // In offline/mock mode, memory representation is preserved
    }
  }

  return category;
}

/**
 * Updates an existing category.
 */
export async function updateAdminCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<CatalogCategory> {
  const existing = MEMORY_ADMIN_CATEGORIES.get(id);
  if (!existing) {
    throw new Error(`Category ${id} not found.`);
  }

  const updated: CatalogCategory = {
    ...existing,
    name: input.name !== undefined ? input.name.trim() : existing.name,
    slug: input.slug !== undefined ? slugify(input.slug) : existing.slug,
    description: input.description !== undefined ? (input.description ? input.description.trim() : null) : existing.description,
    imageUrl: input.imageUrl !== undefined ? (input.imageUrl ? input.imageUrl.trim() : null) : existing.imageUrl,
    sortOrder: input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder,
  };

  MEMORY_ADMIN_CATEGORIES.set(id, updated);

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const categoriesTable = getGenericClient(supabase).from("categories");
      await categoriesTable
        .update({
          name: updated.name,
          slug: updated.slug,
          description: updated.description,
          image_url: updated.imageUrl,
          sort_order: updated.sortOrder,
        })
        .eq("id", id);
    } catch {
      // Fallback
    }
  }

  return updated;
}

/**
 * Deletes a category.
 */
export async function deleteAdminCategory(id: string): Promise<boolean> {
  const existing = MEMORY_ADMIN_CATEGORIES.get(id);
  if (!existing) {
    throw new Error(`Category ${id} not found.`);
  }

  MEMORY_ADMIN_CATEGORIES.delete(id);

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const categoriesTable = getGenericClient(supabase).from("categories");
      await categoriesTable.delete().eq("id", id);
    } catch {
      // Fallback
    }
  }

  return true;
}

/**
 * Lists all products in the store for administrative catalog management.
 */
export async function listAdminProducts(): Promise<CatalogProduct[]> {
  if (MEMORY_ADMIN_PRODUCTS.size === 0) {
    FIXTURE_PRODUCTS.forEach((p) => MEMORY_ADMIN_PRODUCTS.set(p.id, { ...p }));
  }

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          category_id,
          slug,
          title,
          description,
          product_type,
          base_price_minor,
          currency,
          status,
          stock_mode,
          stock_quantity,
          lead_time_days,
          is_featured,
          created_at,
          categories ( id, slug, name ),
          product_media ( id, storage_path, public_url, alt_text, display_order )
        `)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        interface SupabaseRawProduct {
          id: string;
          category_id: string | null;
          slug: string;
          title: string;
          description: string;
          product_type: CatalogProduct["productType"];
          base_price_minor: number;
          currency: string;
          status: string;
          stock_mode: CatalogProduct["stockMode"];
          stock_quantity: number;
          lead_time_days: number;
          is_featured: boolean;
          created_at: string;
          categories: { id: string; slug: string; name: string } | null;
          product_media: Array<{ id: string; storage_path: string; public_url: string; alt_text: string | null; display_order: number }>;
        }

        const liveList: CatalogProduct[] = (data as unknown as SupabaseRawProduct[]).map((row) => {
          const sortedMedia = (row.product_media || []).sort(
            (a, b) => a.display_order - b.display_order
          );
          const primaryImage =
            sortedMedia[0]?.public_url || "/images/placeholder.jpg";

          return {
            id: row.id,
            categoryId: row.category_id,
            categorySlug: row.categories?.slug,
            categoryName: row.categories?.name,
            slug: row.slug,
            title: row.title,
            description: row.description,
            productType: row.product_type,
            basePriceMinor: row.base_price_minor,
            currency: row.currency,
            status: row.status as ProductStatus,
            stockMode: row.stock_mode,
            stockQuantity: row.stock_quantity,
            leadTimeDays: row.lead_time_days,
            isFeatured: row.is_featured,
            primaryImage,
            media: sortedMedia.map((m) => ({
              id: m.id,
              productId: row.id,
              storagePath: m.storage_path,
              publicUrl: m.public_url,
              altText: m.alt_text || row.title,
              displayOrder: m.display_order,
            })),
            createdAt: row.created_at,
          };
        });

        liveList.forEach((p) => MEMORY_ADMIN_PRODUCTS.set(p.id, p));
        return liveList;
      }
    } catch {
      // Fallback to memory
    }
  }

  const list = Array.from(MEMORY_ADMIN_PRODUCTS.values());
  return list.sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Retrieves a single product by ID for admin viewing/editing.
 */
export async function getAdminProduct(id: string): Promise<CatalogProduct | null> {
  const products = await listAdminProducts();
  return products.find((p) => p.id === id) || null;
}

/**
 * Creates a brand-new catalog product with images and categories.
 */
export async function createAdminProduct(input: CreateProductInput): Promise<CatalogProduct> {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Product title is required.");
  }

  if (input.basePriceMinor <= 0 || !Number.isInteger(input.basePriceMinor)) {
    throw new Error("Price must be a positive integer in paisa minor units (1 PKR = 100 paisa).");
  }

  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(title);
  const id = `prod-${Date.now()}`;
  const now = new Date().toISOString();

  // Find category name/slug if categoryId provided
  let categoryName: string | undefined;
  let categorySlug: string | undefined;
  if (input.categoryId) {
    const cat = MEMORY_ADMIN_CATEGORIES.get(input.categoryId);
    if (cat) {
      categoryName = cat.name;
      categorySlug = cat.slug;
    }
  }

  const mediaUrls = input.mediaUrls && input.mediaUrls.length > 0
    ? input.mediaUrls
    : (input.primaryImage ? [input.primaryImage] : ["/images/placeholder.jpg"]);

  const media = mediaUrls.map((url, idx) => ({
    id: `med-${Date.now()}-${idx}`,
    productId: id,
    storagePath: `product-media/${slug}-${idx}.jpg`,
    publicUrl: url,
    altText: title,
    displayOrder: idx,
  }));

  const product: CatalogProduct = {
    id,
    categoryId: input.categoryId || null,
    categoryName,
    categorySlug,
    slug,
    title,
    description: input.description.trim(),
    productType: input.productType || "ready_made",
    basePriceMinor: input.basePriceMinor,
    currency: "PKR",
    status: input.status || "draft",
    stockMode: input.stockMode || "tracked",
    stockQuantity: input.stockQuantity ?? 0,
    leadTimeDays: input.leadTimeDays ?? 7,
    isFeatured: Boolean(input.isFeatured),
    primaryImage: media[0].publicUrl,
    media,
    createdAt: now,
  };

  MEMORY_ADMIN_PRODUCTS.set(id, product);

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const genericClient = getGenericClient(supabase);
      const { data: dbProd, error: prodErr } = await genericClient
        .from("products")
        .insert({
          category_id: input.categoryId || null,
          slug,
          title,
          description: input.description.trim(),
          product_type: product.productType,
          base_price_minor: product.basePriceMinor,
          currency: "PKR",
          status: product.status,
          stock_mode: product.stockMode,
          stock_quantity: product.stockQuantity,
          lead_time_days: product.leadTimeDays,
          is_featured: product.isFeatured,
        })
        .select("id")
        .single();

      if (!prodErr && dbProd) {
        product.id = dbProd.id;
        MEMORY_ADMIN_PRODUCTS.delete(id);
        MEMORY_ADMIN_PRODUCTS.set(dbProd.id, product);

        if (media.length > 0) {
          const mediaRows = media.map((m, idx) => ({
            product_id: dbProd.id,
            storage_path: m.storagePath,
            public_url: m.publicUrl,
            alt_text: title,
            display_order: idx,
          }));
          await genericClient.from("product_media").insert(mediaRows);
        }
      }
    } catch {
      // Offline fallback preserved
    }
  }

  return product;
}

/**
 * Updates an existing catalog product.
 */
export async function updateAdminProduct(
  id: string,
  input: UpdateProductInput
): Promise<CatalogProduct> {
  const existing = await getAdminProduct(id);
  if (!existing) {
    throw new Error(`Product ${id} not found.`);
  }

  const updated: CatalogProduct = {
    ...existing,
    title: input.title !== undefined ? input.title.trim() : existing.title,
    slug: input.slug !== undefined ? slugify(input.slug) : existing.slug,
    description: input.description !== undefined ? input.description.trim() : existing.description,
    categoryId: input.categoryId !== undefined ? input.categoryId : existing.categoryId,
    productType: input.productType || existing.productType,
    basePriceMinor: input.basePriceMinor !== undefined ? input.basePriceMinor : existing.basePriceMinor,
    stockMode: input.stockMode || existing.stockMode,
    stockQuantity: input.stockQuantity !== undefined ? input.stockQuantity : existing.stockQuantity,
    leadTimeDays: input.leadTimeDays !== undefined ? input.leadTimeDays : existing.leadTimeDays,
    isFeatured: input.isFeatured !== undefined ? input.isFeatured : existing.isFeatured,
    status: input.status || existing.status,
  };

  if (input.categoryId) {
    const cat = MEMORY_ADMIN_CATEGORIES.get(input.categoryId);
    if (cat) {
      updated.categoryName = cat.name;
      updated.categorySlug = cat.slug;
    }
  }

  if (input.mediaUrls && input.mediaUrls.length > 0) {
    updated.media = input.mediaUrls.map((url, idx) => ({
      id: `med-${Date.now()}-${idx}`,
      productId: id,
      storagePath: `product-media/${updated.slug}-${idx}.jpg`,
      publicUrl: url,
      altText: updated.title,
      displayOrder: idx,
    }));
    updated.primaryImage = updated.media[0].publicUrl;
  } else if (input.primaryImage) {
    updated.primaryImage = input.primaryImage;
    if (updated.media.length > 0) {
      updated.media[0].publicUrl = input.primaryImage;
    }
  }

  MEMORY_ADMIN_PRODUCTS.set(id, updated);

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const genericClient = getGenericClient(supabase);
      await genericClient
        .from("products")
        .update({
          title: updated.title,
          slug: updated.slug,
          description: updated.description,
          category_id: updated.categoryId,
          product_type: updated.productType,
          base_price_minor: updated.basePriceMinor,
          stock_mode: updated.stockMode,
          stock_quantity: updated.stockQuantity,
          lead_time_days: updated.leadTimeDays,
          is_featured: updated.isFeatured,
          status: updated.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    } catch {
      // Fallback
    }
  }

  return updated;
}

/**
 * Deletes a product.
 */
export async function deleteAdminProduct(id: string): Promise<boolean> {
  const existing = await getAdminProduct(id);
  if (!existing) {
    throw new Error(`Product ${id} not found.`);
  }

  MEMORY_ADMIN_PRODUCTS.delete(id);

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const genericClient = getGenericClient(supabase);
      await genericClient.from("products").delete().eq("id", id);
    } catch {
      // Fallback
    }
  }

  return true;
}

/**
 * Updates a product's in-stock inventory count.
 */
export async function updateProductStock(
  productId: string,
  stockQuantity: number
): Promise<CatalogProduct> {
  if (stockQuantity < 0) {
    throw new Error("Stock quantity cannot be negative.");
  }

  return updateAdminProduct(productId, { stockQuantity });
}

/**
 * Updates a product's base price in paisa integer minor units (1 PKR = 100 paisa).
 */
export async function updateProductPrice(
  productId: string,
  basePriceMinor: number
): Promise<CatalogProduct> {
  if (basePriceMinor <= 0 || !Number.isInteger(basePriceMinor)) {
    throw new Error("Price must be a positive integer in paisa minor units.");
  }

  return updateAdminProduct(productId, { basePriceMinor });
}

/**
 * Toggles or updates a product's catalog status (published, draft, archived).
 */
export async function toggleProductStatus(
  productId: string,
  status: ProductStatus
): Promise<CatalogProduct> {
  return updateAdminProduct(productId, { status });
}
