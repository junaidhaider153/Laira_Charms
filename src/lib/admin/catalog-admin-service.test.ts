import { describe, it, expect, beforeEach } from "vitest";
import {
  listAdminProducts,
  updateProductStock,
  updateProductPrice,
  toggleProductStatus,
  MEMORY_ADMIN_PRODUCTS,
} from "./catalog-admin-service";
import { FIXTURE_PRODUCTS } from "@/lib/catalog/fixtures";

describe("Catalog Admin Service", () => {
  beforeEach(() => {
    MEMORY_ADMIN_PRODUCTS.clear();
    FIXTURE_PRODUCTS.forEach((p) => MEMORY_ADMIN_PRODUCTS.set(p.id, { ...p }));
  });

  it("lists all catalog products sorted by title", async () => {
    const products = await listAdminProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].title).toBeDefined();
  });

  it("updates product stock inventory", async () => {
    const target = FIXTURE_PRODUCTS[0];
    const updated = await updateProductStock(target.id, 45);

    expect(updated.stockQuantity).toBe(45);
    const refreshed = await listAdminProducts();
    const match = refreshed.find((p) => p.id === target.id);
    expect(match?.stockQuantity).toBe(45);
  });

  it("rejects negative stock updates", async () => {
    const target = FIXTURE_PRODUCTS[0];
    await expect(updateProductStock(target.id, -5)).rejects.toThrow(
      /Stock quantity cannot be negative/i
    );
  });

  it("updates product base price in integer minor units (paisa)", async () => {
    const target = FIXTURE_PRODUCTS[0];
    // Rs. 1,500 = 150000 paisa
    const updated = await updateProductPrice(target.id, 150000);

    expect(updated.basePriceMinor).toBe(150000);
  });

  it("rejects invalid prices (floats or non-positive amounts)", async () => {
    const target = FIXTURE_PRODUCTS[0];
    await expect(updateProductPrice(target.id, 0)).rejects.toThrow();
    await expect(updateProductPrice(target.id, 1250.55)).rejects.toThrow();
  });

  it("toggles product catalog visibility status", async () => {
    const target = FIXTURE_PRODUCTS[0];
    const draft = await toggleProductStatus(target.id, "draft");
    expect(draft.status).toBe("draft");

    const published = await toggleProductStatus(target.id, "published");
    expect(published.status).toBe("published");
  });
});
