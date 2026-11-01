import { FIXTURE_PRODUCTS } from "@/lib/catalog/fixtures";
import type { CatalogProduct, ProductStatus } from "@/lib/catalog/types";

function isLiveSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes("dummy-project") || url.includes("example.com")) {
    return false;
  }
  return true;
}

type SupabaseUpdateTable = {
  update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<unknown> };
};

export const MEMORY_ADMIN_PRODUCTS: Map<string, CatalogProduct> = new Map();

// Initialize memory products from fixtures
FIXTURE_PRODUCTS.forEach((prod) => {
  MEMORY_ADMIN_PRODUCTS.set(prod.id, { ...prod });
});

/**
 * Lists all products in the store for administrative catalog management.
 */
export async function listAdminProducts(): Promise<CatalogProduct[]> {
  if (MEMORY_ADMIN_PRODUCTS.size === 0) {
    FIXTURE_PRODUCTS.forEach((p) => MEMORY_ADMIN_PRODUCTS.set(p.id, { ...p }));
  }

  const list = Array.from(MEMORY_ADMIN_PRODUCTS.values());
  return list.sort((a, b) => a.title.localeCompare(b.title));
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

  const product = MEMORY_ADMIN_PRODUCTS.get(productId);
  if (!product) {
    throw new Error(`Product ${productId} not found.`);
  }

  product.stockQuantity = stockQuantity;
  MEMORY_ADMIN_PRODUCTS.set(productId, product);

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      await (supabase.from("products") as unknown as SupabaseUpdateTable)
        .update({ stock_quantity: stockQuantity, updated_at: new Date().toISOString() })
        .eq("id", productId);
    } catch {
      // Fallback
    }
  }

  return product;
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

  const product = MEMORY_ADMIN_PRODUCTS.get(productId);
  if (!product) {
    throw new Error(`Product ${productId} not found.`);
  }

  product.basePriceMinor = basePriceMinor;
  MEMORY_ADMIN_PRODUCTS.set(productId, product);

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      await (supabase.from("products") as unknown as SupabaseUpdateTable)
        .update({ base_price_minor: basePriceMinor, updated_at: new Date().toISOString() })
        .eq("id", productId);
    } catch {
      // Fallback
    }
  }

  return product;
}

/**
 * Toggles or updates a product's catalog status (active, draft, archived).
 */
export async function toggleProductStatus(
  productId: string,
  status: ProductStatus
): Promise<CatalogProduct> {
  const product = MEMORY_ADMIN_PRODUCTS.get(productId);
  if (!product) {
    throw new Error(`Product ${productId} not found.`);
  }

  product.status = status;
  MEMORY_ADMIN_PRODUCTS.set(productId, product);

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      await (supabase.from("products") as unknown as SupabaseUpdateTable)
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", productId);
    } catch {
      // Fallback
    }
  }

  return product;
}
