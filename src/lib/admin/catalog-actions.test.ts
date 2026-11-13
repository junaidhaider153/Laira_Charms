import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  updateProductStockAction,
  updateProductPriceAction,
  toggleProductStatusAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "./catalog-actions";
import {
  MEMORY_ADMIN_PRODUCTS,
  MEMORY_ADMIN_CATEGORIES,
} from "./catalog-admin-service";
import { FIXTURE_PRODUCTS, FIXTURE_CATEGORIES } from "@/lib/catalog/fixtures";

// Mock guardAdmin to allow testing offline/dev flows
vi.mock("@/lib/auth/guards", () => ({
  guardAdmin: vi.fn().mockResolvedValue({
    id: "admin-test",
    role: "admin",
    email: "admin@lairacharms.pk",
  }),
}));

// Mock revalidatePath
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Catalog Admin Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    MEMORY_ADMIN_PRODUCTS.clear();
    FIXTURE_PRODUCTS.forEach((p) => MEMORY_ADMIN_PRODUCTS.set(p.id, { ...p }));

    MEMORY_ADMIN_CATEGORIES.clear();
    FIXTURE_CATEGORIES.forEach((c) => MEMORY_ADMIN_CATEGORIES.set(c.id, { ...c }));
  });

  describe("Product Actions", () => {
    it("creates a new product successfully with valid data", async () => {
      const result = await createProductAction({
        title: "Rose Quartz Resin Charm",
        description: "Handcrafted rose quartz resin keepsake charm with gold foil flakes.",
        basePriceMinor: 145000, // Rs. 1,450
        stockQuantity: 25,
        status: "published",
        isFeatured: true,
      });

      expect(result.success).toBe(true);
      expect(result.product?.title).toBe("Rose Quartz Resin Charm");
      expect(result.product?.basePriceMinor).toBe(145000);
      expect(result.product?.stockQuantity).toBe(25);
      expect(result.product?.status).toBe("published");
    });

    it("rejects product creation when title is too short", async () => {
      const result = await createProductAction({
        title: "A",
        description: "Valid description but invalid title.",
        basePriceMinor: 100000,
        stockQuantity: 10,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Title must be at least 2 characters");
    });

    it("rejects product creation when price is below minimum", async () => {
      const result = await createProductAction({
        title: "Valid Title",
        description: "Valid description",
        basePriceMinor: 50, // Less than 100 paisa
        stockQuantity: 10,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Price must be at least 1 PKR");
    });

    it("updates existing product fields", async () => {
      const target = FIXTURE_PRODUCTS[0];
      const result = await updateProductAction({
        productId: target.id,
        title: "Updated Strawberry Delight",
        basePriceMinor: 160000,
        stockQuantity: 30,
      });

      expect(result.success).toBe(true);
      expect(result.product?.title).toBe("Updated Strawberry Delight");
      expect(result.product?.basePriceMinor).toBe(160000);
      expect(result.product?.stockQuantity).toBe(30);
    });

    it("deletes a product", async () => {
      const target = FIXTURE_PRODUCTS[0];
      const result = await deleteProductAction({ productId: target.id });

      expect(result.success).toBe(true);
      expect(MEMORY_ADMIN_PRODUCTS.has(target.id)).toBe(false);
    });

    it("updates product stock", async () => {
      const target = FIXTURE_PRODUCTS[0];
      const result = await updateProductStockAction({
        productId: target.id,
        stockQuantity: 50,
      });

      expect(result.success).toBe(true);
      expect(result.product?.stockQuantity).toBe(50);
    });

    it("updates product price", async () => {
      const target = FIXTURE_PRODUCTS[0];
      const result = await updateProductPriceAction({
        productId: target.id,
        basePriceMinor: 180000,
      });

      expect(result.success).toBe(true);
      expect(result.product?.basePriceMinor).toBe(180000);
    });

    it("toggles product publication status", async () => {
      const target = FIXTURE_PRODUCTS[0];
      const result = await toggleProductStatusAction({
        productId: target.id,
        status: "draft",
      });

      expect(result.success).toBe(true);
      expect(result.product?.status).toBe("draft");
    });
  });

  describe("Category Actions", () => {
    it("creates a new category", async () => {
      const result = await createCategoryAction({
        name: "Enamel Pins & Badges",
        description: "Handcrafted miniature clay and enamel brooch pins.",
        imageUrl: "/images/pins.jpg",
        sortOrder: 4,
      });

      expect(result.success).toBe(true);
      expect(result.category?.name).toBe("Enamel Pins & Badges");
      expect(result.category?.slug).toBe("enamel-pins-badges");
      expect(result.category?.sortOrder).toBe(4);
    });

    it("rejects category creation with empty name", async () => {
      const result = await createCategoryAction({
        name: " ",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Category name must be at least 2 characters");
    });

    it("updates an existing category", async () => {
      const target = FIXTURE_CATEGORIES[0];
      const result = await updateCategoryAction({
        categoryId: target.id,
        name: "Ready-to-Ship Charms",
        sortOrder: 10,
      });

      expect(result.success).toBe(true);
      expect(result.category?.name).toBe("Ready-to-Ship Charms");
      expect(result.category?.sortOrder).toBe(10);
    });

    it("deletes a category", async () => {
      const target = FIXTURE_CATEGORIES[0];
      const result = await deleteCategoryAction({ categoryId: target.id });

      expect(result.success).toBe(true);
      expect(MEMORY_ADMIN_CATEGORIES.has(target.id)).toBe(false);
    });
  });
});

