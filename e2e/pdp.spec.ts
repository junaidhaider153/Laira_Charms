import { test, expect } from "@playwright/test";

test.describe("Product Detail Page & Media Gallery", () => {
  test("displays artisanal product details, lead time, and care instructions", async ({ page }) => {
    await page.goto("/products/strawberry-milk-carton-charm");

    // Title and Breadcrumbs
    await expect(page.locator("h1")).toContainText("Strawberry Milk Carton Keychain");
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText("Ready-Made Charms");

    // Price and Lead Time
    await expect(page.locator("body")).toContainText("Rs. 1,200");
    await expect(page.locator("body")).toContainText(/Dispatches in 24 hours/i);

    // Artisanal Quality & Care
    await expect(page.locator("body")).toContainText(/Triple UV Diamond Glaze/i);
    await expect(page.locator("body")).toContainText(/Handcrafted in Pakistan/i);

    // Related Products Section
    await expect(page.locator("body")).toContainText(/You Might Also Adore/i);
  });

  test("media gallery switches thumbnails and opens/dismisses lightbox via Escape key", async ({ page }) => {
    await page.goto("/products/strawberry-milk-carton-charm");

    // Thumbnails should be visible
    const thumbnails = page.getByRole("tablist", { name: /Product image thumbnails/i }).getByRole("tab");
    await expect(thumbnails.first()).toBeVisible({ timeout: 10000 });
    const count = await thumbnails.count();
    expect(count).toBeGreaterThan(1);

    // Click second thumbnail
    await thumbnails.nth(1).click();
    await expect(thumbnails.nth(1)).toHaveAttribute("aria-selected", "true");

    // Open Lightbox by clicking main product visual
    const mainVisual = page.getByRole("region", { name: /Main product visual/i });
    await mainVisual.click();

    // Lightbox dialog should be open
    const lightbox = page.getByRole("dialog", { name: /image zoom view/i });
    await expect(lightbox).toBeVisible();

    // Dismiss lightbox via Escape key
    await page.keyboard.press("Escape");
    await expect(lightbox).not.toBeVisible();
  });

  test("quantity adjustment and Add to Bag opens cart drawer with updated count", async ({ page }) => {
    await page.goto("/products/strawberry-milk-carton-charm");

    // Increase quantity to 2
    const incButton = page.getByRole("button", { name: "Increase quantity" });
    await incButton.click();

    // Click Add to Bag
    const addToBagButton = page.getByRole("button", { name: /Add to Bag/i });
    await addToBagButton.click();

    // Shopping Bag Drawer should slide open
    const drawer = page.getByRole("dialog", { name: /Shopping Bag/i });
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText(/Your Charm Bag \(2\)/i);
    await expect(drawer).toContainText("Rs. 2,400");

    // Dismiss drawer
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
  });

  test("displays 404 not found page gracefully when charm slug does not exist", async ({ page }) => {
    await page.goto("/products/nonexistent-charm-slug-404");
    await expect(page.locator("h1")).toContainText(/Page Not Found/i);
    await expect(page.getByRole("link", { name: /Explore Collection/i })).toBeVisible();
  });
});

