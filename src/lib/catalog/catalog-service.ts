import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FIXTURE_CATEGORIES, FIXTURE_PRODUCTS } from "./fixtures";
import { isLiveSupabaseConfigured } from "@/lib/auth/offline-mode";
import { tokenizeSearchQuery, matchesAllTokens } from "./search";
import type {
  CatalogCategory,
  CatalogProduct,
  CatalogFilterParams,
  CatalogProductMedia,
  ProductStatus,
} from "./types";

interface DbCategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

interface DbProductMediaRow {
  id: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  display_order: number;
}

interface DbProductRow {
  id: string;
  category_id: string;
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
  product_media: DbProductMediaRow[];
}


/**
 * Retrieves all published categories.
 */
export async function getCategories(): Promise<CatalogCategory[]> {
  if (!isLiveSupabaseConfigured()) {
    return FIXTURE_CATEGORIES;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, description, image_url, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return (data as unknown as DbCategoryRow[]).map((cat) => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.image_url,
        sortOrder: cat.sort_order,
      }));
    }
  } catch {
    // Fall back to verified fixtures on network or database unreachability
  }

  return FIXTURE_CATEGORIES;
}

/**
 * Retrieves a category by its unique slug.
 */
export async function getCategoryBySlug(slug: string): Promise<CatalogCategory | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) || null;
}

/**
 * Queries catalog products with filtering, searching, and sorting.
 */
export async function getProducts(params: CatalogFilterParams = {}): Promise<{
  products: CatalogProduct[];
  total: number;
}> {
  const {
    categorySlug,
    query,
    productType,
    minPriceMinor,
    maxPriceMinor,
    sort = "newest",
    limit = 24,
    offset = 0,
  } = params;

  // Attempt database retrieval if live Supabase is configured
  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      let dbQuery = supabase
        .from("products")
        .select(
          `
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
      `,
          { count: "exact" }
        )
        .eq("status", "published");

      if (productType) {
        dbQuery = dbQuery.eq("product_type", productType);
      }

      if (minPriceMinor !== undefined) {
        dbQuery = dbQuery.gte("base_price_minor", minPriceMinor);
      }

      if (maxPriceMinor !== undefined) {
        dbQuery = dbQuery.lte("base_price_minor", maxPriceMinor);
      }

      const tokens = tokenizeSearchQuery(query);
      if (tokens.length > 0) {
        for (const token of tokens) {
          dbQuery = dbQuery.or(
            `title.ilike.%${token}%,description.ilike.%${token}%,slug.ilike.%${token}%`
          );
        }
      }

      // Apply sorting
      switch (sort) {
        case "price_asc":
          dbQuery = dbQuery.order("base_price_minor", { ascending: true });
          break;
        case "price_desc":
          dbQuery = dbQuery.order("base_price_minor", { ascending: false });
          break;
        case "title_asc":
          dbQuery = dbQuery.order("title", { ascending: true });
          break;
        case "newest":
        default:
          dbQuery = dbQuery.order("created_at", { ascending: false });
          break;
      }

      dbQuery = dbQuery.range(offset, offset + limit - 1);

      const { data, count, error } = await dbQuery;

      if (!error && data && data.length > 0) {
        const rows = data as unknown as DbProductRow[];
        const mapped = rows.map((row) => {
          const mediaList: CatalogProductMedia[] = (row.product_media || [])
            .sort((a, b) => a.display_order - b.display_order)
            .map((m) => ({
              id: m.id,
              productId: row.id,
              storagePath: m.storage_path,
              publicUrl: m.public_url,
              altText: m.alt_text || "",
              displayOrder: m.display_order,
            }));

          return {
            id: row.id,
            categoryId: row.category_id,
            categorySlug: row.categories?.slug,
            categoryName: row.categories?.name,
            slug: row.slug,
            title: row.title,
            description: row.description,
            productType: row.product_type,
            basePriceMinor: Number(row.base_price_minor),
            currency: row.currency,
            status: row.status as ProductStatus,
            stockMode: row.stock_mode,
            stockQuantity: row.stock_quantity,
            leadTimeDays: row.lead_time_days,
            isFeatured: row.is_featured,
            media: mediaList,
            primaryImage: mediaList[0]?.publicUrl || "/images/placeholder.jpg",
            createdAt: row.created_at,
          };
        });

        return { products: mapped, total: count || mapped.length };
      }
    } catch {
      // Seamless fallback to memory fixtures
    }
  }

  // Memory fixture filter evaluation
  let filtered = [...FIXTURE_PRODUCTS];

  if (categorySlug) {
    filtered = filtered.filter((p) => p.categorySlug === categorySlug);
  }

  if (productType) {
    filtered = filtered.filter((p) => p.productType === productType);
  }

  const tokens = tokenizeSearchQuery(query);
  if (tokens.length > 0) {
    filtered = filtered.filter((p) =>
      matchesAllTokens(tokens, [p.title, p.description, p.categoryName, p.slug])
    );
  }

  if (minPriceMinor !== undefined) {
    filtered = filtered.filter((p) => p.basePriceMinor >= minPriceMinor);
  }

  if (maxPriceMinor !== undefined) {
    filtered = filtered.filter((p) => p.basePriceMinor <= maxPriceMinor);
  }

  // Sort
  switch (sort) {
    case "price_asc":
      filtered.sort((a, b) => a.basePriceMinor - b.basePriceMinor);
      break;
    case "price_desc":
      filtered.sort((a, b) => b.basePriceMinor - a.basePriceMinor);
      break;
    case "title_asc":
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "newest":
    default:
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  return { products: paginated, total };
}

/**
 * Retrieves a single published product by slug.
 */
export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const { products } = await getProducts({ limit: 100 });
  return products.find((p) => p.slug === slug) || null;
}

/**
 * Retrieves a single product by its unique ID.
 */
export async function getProductById(id: string): Promise<CatalogProduct | null> {
  if (isLiveSupabaseConfigured()) {
    try {
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
          categories (id, slug, name),
          product_media (id, storage_path, public_url, alt_text, display_order)
        `)
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        const row = data as unknown as DbProductRow;
        const mediaList: CatalogProductMedia[] = (row.product_media || [])
          .sort((a, b) => a.display_order - b.display_order)
          .map((m) => ({
            id: m.id,
            productId: row.id,
            storagePath: m.storage_path,
            publicUrl: m.public_url,
            altText: m.alt_text || "",
            displayOrder: m.display_order,
          }));

        return {
          id: row.id,
          categoryId: row.category_id,
          categorySlug: row.categories?.slug,
          categoryName: row.categories?.name,
          slug: row.slug,
          title: row.title,
          description: row.description,
          productType: row.product_type,
          basePriceMinor: Number(row.base_price_minor),
          currency: row.currency,
          status: row.status as ProductStatus,
          stockMode: row.stock_mode,
          stockQuantity: row.stock_quantity,
          leadTimeDays: row.lead_time_days,
          isFeatured: row.is_featured,
          media: mediaList,
          primaryImage: mediaList[0]?.publicUrl || "/images/placeholder.jpg",
          createdAt: row.created_at,
        };
      }
    } catch {
      // Fall through to memory fixtures
    }
  }

  return FIXTURE_PRODUCTS.find((p) => p.id === id || p.slug === id) || null;
}

