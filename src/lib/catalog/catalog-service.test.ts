import { describe, it, expect, vi } from "vitest";
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
  getProductBySlug,
} from "./catalog-service";

// Mock Supabase server to trigger memory fixture branch
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn().mockRejectedValue(new Error("Use fixtures")),
}));

describe("Catalog Service", () => {
  describe("getCategories", () => {
    it("returns all active categories ordered by sortOrder", async () => {
      const categories = await getCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0].slug).toBe("ready-made-charms");
    });
  });

  describe("getCategoryBySlug", () => {
    it("finds category by valid slug", async () => {
      const category = await getCategoryBySlug("ready-made-charms");
      expect(category).not.toBeNull();
      expect(category?.name).toBe("Ready-Made Charms");
    });

    it("returns null for non-existent category", async () => {
      const category = await getCategoryBySlug("non-existent-category");
      expect(category).toBeNull();
    });
  });

  describe("getProducts", () => {
    it("returns all published products when no filters applied", async () => {
      const { products, total } = await getProducts();
      expect(products.length).toBeGreaterThanOrEqual(6);
      expect(total).toBeGreaterThanOrEqual(6);
    });

    it("filters products by category slug", async () => {
      const { products } = await getProducts({ categorySlug: "ready-made-charms" });
      expect(products.length).toBeGreaterThan(0);
      expect(products.every((p) => p.categorySlug === "ready-made-charms")).toBe(true);
    });

    it("searches products by title and description keyword", async () => {
      const { products } = await getProducts({ query: "strawberry" });
      expect(products.length).toBeGreaterThan(0);
      expect(products[0].title.toLowerCase()).toContain("strawberry");
    });

    it("filters products by price range in minor units (paisa)", async () => {
      // Filter for items under Rs. 1,000 (100,000 minor)
      const { products } = await getProducts({ maxPriceMinor: 100000 });
      expect(products.length).toBeGreaterThan(0);
      expect(products.every((p) => p.basePriceMinor <= 100000)).toBe(true);
    });

    it("sorts products by price ascending", async () => {
      const { products } = await getProducts({ sort: "price_asc" });
      for (let i = 0; i < products.length - 1; i++) {
        expect(products[i].basePriceMinor).toBeLessThanOrEqual(
          products[i + 1].basePriceMinor
        );
      }
    });

    it("sorts products by price descending", async () => {
      const { products } = await getProducts({ sort: "price_desc" });
      for (let i = 0; i < products.length - 1; i++) {
        expect(products[i].basePriceMinor).toBeGreaterThanOrEqual(
          products[i + 1].basePriceMinor
        );
      }
    });
  });

  describe("getProductBySlug", () => {
    it("retrieves product by valid slug", async () => {
      const product = await getProductBySlug("strawberry-milk-carton-charm");
      expect(product).not.toBeNull();
      expect(product?.title).toBe("Strawberry Milk Carton Keychain");
      expect(product?.productType).toBe("ready_made");
    });

    it("returns null for non-existent slug", async () => {
      const product = await getProductBySlug("imaginary-charm");
      expect(product).toBeNull();
    });
  });
});

