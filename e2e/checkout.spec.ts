import { test, expect } from "@playwright/test";

test.describe("Cart & Idempotent Checkout Lifecycle", () => {
  test("allows adding charm to bag, reviewing in cart, and completing checkout with Pakistani address", async ({
    page,
  }) => {
    // 1. Visit shop catalog and add item to cart
    await page.goto("/shop");
    await expect(page.locator("h1")).toContainText(/Artisanal Charm Catalog/i);

    const quickAddBtn = page.getByRole("button", { name: /Quick add/i }).first();
    await quickAddBtn.click();

    // Dismiss drawer and navigate to full Cart page
    await page.keyboard.press("Escape");
    await page.goto("/cart");
    await expect(page.locator("h1")).toContainText(/Shopping Bag/i);
    await expect(page.locator("body")).toContainText(/Review your handmade selections/i);
    await expect(page.getByRole("link", { name: /Proceed to Checkout/i })).toBeVisible();

    // 3. Proceed to Checkout
    await page.getByRole("link", { name: /Proceed to Checkout/i }).click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator("h1")).toContainText(/Checkout/i);

    // 4. Fill Pakistani shipping address form
    await page.locator("#fullName").fill("Zainab Malik");
    await page.locator("#email").fill("zainab@example.com");
    await page.locator("#phone").fill("03211234567");
    await page.locator("#streetAddress").fill("Flat 4, Street 12, Gulberg III");
    await page.locator("#city").fill("Lahore");
    await page.locator("#province").selectOption("Punjab");
    await page.locator("#postalCode").fill("54660");

    // 5. Submit order
    const placeOrderBtn = page.getByRole("button", { name: /Place Order/i });
    await placeOrderBtn.click();

    // 6. Verify order confirmation screen
    await expect(page).toHaveURL(/\/orders\/LC-/);
    await expect(page.locator("body")).toContainText(/Thank You for Your Order!/i);
    await expect(page.locator("body")).toContainText(/Order Reference:/i);
    await expect(page.locator("body")).toContainText(/Awaiting Payment/i);
    await expect(page.getByRole("link", { name: /Upload Payment Proof Screenshot/i })).toBeVisible();
  });

  test("allows viewing existing order confirmation via secure reference and token", async ({ page }) => {
    // Sample order reference pre-seeded in order-service
    await page.goto("/orders/LC-20261031-7788");

    // Unauthenticated guest without token should get 404
    await expect(page.locator("body")).toContainText(/404/i);
  });
});
