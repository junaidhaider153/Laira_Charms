import { test, expect } from "@playwright/test";

test.describe("Laira Charms Smoke Test", () => {
  test("loads storefront homepage with brand identity and links", async ({ page }) => {
    await page.goto("/");

    // Verify document title
    await expect(page).toHaveTitle(/Laira Charms • Handcrafted Keepsakes & Clay Keychains/i);

    // Verify main headline
    const heading = page.locator("h1");
    await expect(heading).toContainText(/Handcrafted keepsakes baked to brighten everyday rituals/i);

    // Verify CTA navigation
    const shopCta = page.getByRole("link", { name: /Browse Ready-Made Charms/i });
    await expect(shopCta).toBeVisible();

    const customCta = page.getByRole("link", { name: /Request Bespoke Charm/i });
    await expect(customCta).toBeVisible();
  });

  test("handles not found route with 404 brand page", async ({ page }) => {
    await page.goto("/non-existent-page");
    await expect(page.locator("h1")).toContainText(/Page Not Found/i);
    await expect(page.getByRole("link", { name: /Explore Collection/i })).toBeVisible();
  });
});
