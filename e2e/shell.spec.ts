import { test, expect } from "@playwright/test";

test.describe("Storefront Shell, Navigation & Policy Pages", () => {
  test("header links navigate to policy and craft pages with breadcrumbs", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Desktop navbar links test - mobile uses drawer navigation");
    await page.goto("/");

    // Click Story & Care in desktop nav
    await page.getByRole("link", { name: "Story & Care" }).first().click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator("h1")).toContainText(/Every charm tells a sweet story/i);
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();

    // Navigate to FAQ
    await page.getByRole("link", { name: "FAQ" }).first().click();
    await expect(page).toHaveURL(/\/faq/);
    await expect(page.locator("h1")).toContainText(/Frequently Asked Questions/i);
  });

  test("footer policy links are accessible and render verified policies", async ({ page }) => {
    await page.goto("/");

    // Shipping Policy
    const shippingLink = page.getByRole("link", { name: /Shipping & Delivery Policy/i });
    await shippingLink.scrollIntoViewIfNeeded();
    await shippingLink.click();
    await expect(page).toHaveURL(/\/shipping/);
    await expect(page.locator("h1")).toContainText(/Shipping & Delivery Policy/i);
    await expect(page.locator("body")).toContainText("Rs. 250");
    await expect(page.locator("body")).toContainText("FREE SHIPPING");

    // Returns Policy
    await page.goto("/");
    const returnsLink = page.getByRole("link", { name: /Returns & Replacement Policy/i });
    await returnsLink.scrollIntoViewIfNeeded();
    await returnsLink.click();
    await expect(page).toHaveURL(/\/returns/);
    await expect(page.locator("h1")).toContainText(/Returns & Replacement Policy/i);
  });

  test("shopping bag drawer opens and can be dismissed via Escape key", async ({ page }) => {
    await page.goto("/");

    const bagButton = page.getByRole("button", { name: /Open shopping bag/i });
    await bagButton.click();

    const drawer = page.getByRole("dialog", { name: /Shopping Bag/i });
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText(/Your charm bag/i);

    // Press Escape to dismiss
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
  });

  test("mobile viewport hamburger menu toggles navigation drawer cleanly", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "This test only runs on mobile viewport");

    await page.goto("/");
    const hamburger = page.getByRole("button", { name: /Toggle mobile menu/i });
    await expect(hamburger).toBeVisible();

    await hamburger.click();
    const navDialog = page.getByRole("dialog", { name: /Mobile Navigation/i });
    await expect(navDialog).toBeVisible();

    // Click Story & Care from inside mobile drawer
    const storyLink = navDialog.getByRole("link", { name: "Story & Care" });
    await storyLink.click();

    await expect(page).toHaveURL(/\/about/);
    await expect(navDialog).not.toBeVisible();
  });
});
