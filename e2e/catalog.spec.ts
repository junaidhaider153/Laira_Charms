import { test, expect } from "@playwright/test";

test.describe("Catalog Discovery, Search & Category Filters", () => {
  test("renders catalog grid and allows category filtering", async ({ page }) => {
    await page.goto("/shop");

    await expect(page.locator("h1")).toContainText(/Artisanal Charm Catalog/i);

    // Verify product cards are displayed
    const productCards = page.locator(".group.relative.bg-surface-cloud");
    await expect(productCards.first()).toBeVisible();

    // Click Category Filter link for Ready-Made Charms inside main
    const readyMadeFilter = page.getByRole("main").getByRole("link", { name: "Ready-Made Charms" });
    await readyMadeFilter.click();

    await expect(page).toHaveURL(/category=ready-made-charms/);
    await expect(page.locator("body")).toContainText("Strawberry Milk Carton Keychain");
  });

  test("quick-add on ready-made charm adds item to bag and opens cart drawer", async ({ page }) => {
    await page.goto("/shop");

    // Locate first quick add action button
    const quickAddBtn = page.getByRole("button", { name: /Quick add/i }).first();
    await expect(quickAddBtn).toBeVisible();
    await quickAddBtn.click();

    // Shopping bag drawer should automatically open
    const drawer = page.getByRole("dialog", { name: /Shopping Bag/i });
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText(/Your Charm Bag \(1\)/i);

    // Dismiss drawer
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
  });

  test("search page finds matching products by query", async ({ page }) => {
    await page.goto("/search?q=strawberry");

    await expect(page.locator("h1")).toContainText(/Search Results/i);
    await expect(page.locator("body")).toContainText(/Found/i);
    await expect(page.locator("body")).toContainText("Strawberry Milk Carton Keychain");
  });

  test("search page shows helpful empty state when no charms match", async ({ page }) => {
    await page.goto("/search?q=nonexistentcharmquery123");

    await expect(page.locator("h1")).toContainText(/Search Results/i);
    await expect(page.locator("body")).toContainText(/No charms found/i);
    await expect(page.getByRole("link", { name: /View All Charms/i })).toBeVisible();
  });
});
