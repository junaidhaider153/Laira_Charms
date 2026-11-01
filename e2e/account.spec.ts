import { test, expect } from "@playwright/test";

test.describe("Customer Account & Admin Catalog Polish Flow", () => {
  test("customer views account overview, adds saved address, and inspects orders", async ({
    page,
  }) => {
    // 1. Visit Customer Account Overview
    await page.goto("/account");

    await expect(page.locator("h1")).toContainText(/My Studio Account/i);
    await expect(page.locator("body")).toContainText("Total Orders Placed");
    await expect(page.locator("body")).toContainText("Default Delivery Destination");

    // 2. Navigate to Saved Addresses
    const addressesTab = page.getByRole("link", { name: /Saved Addresses/i });
    await addressesTab.click();

    await expect(page.getByRole("heading", { name: /Saved Delivery Addresses/i })).toBeVisible();
    await expect(page.locator("body")).toContainText("Ayesha Noor");

    // 3. Add a new Pakistani address
    const addAddressBtn = page.getByRole("button", { name: /\+ Add New Address/i });
    await addAddressBtn.click();

    await page.locator("#recipientName").fill("Zainab Bibi");
    await page.locator("#phone").fill("03011234567");
    await page.locator("#addressLine1").fill("House 55, Street 4, Sector G-11/2");
    await page.locator("#city").fill("Islamabad");
    await page.locator("#province").selectOption("Islamabad Capital Territory");
    await page.locator("#postalCode").fill("44000");

    const saveBtn = page.getByRole("button", { name: /Save Address/i });
    await saveBtn.click();

    // Verify new address appears in the cards grid
    await expect(page.locator("body")).toContainText("Zainab Bibi");
    await expect(page.locator("body")).toContainText("House 55, Street 4, Sector G-11/2");

    // 4. Navigate to Order History
    const ordersTab = page.getByRole("link", { name: /Order History/i });
    await ordersTab.click();

    await expect(page.getByRole("heading", { name: /Commission & Order History/i })).toBeVisible();
    await expect(page.locator("body")).toContainText("LC-20261031-7788");

    // 5. Admin visits Catalog Management
    await page.goto("/admin/products");
    await expect(page.getByRole("heading", { name: /Artisanal Catalog & Inventory/i })).toBeVisible();

    // Verify product rows exist
    await expect(page.locator("body")).toContainText("Strawberry Milk Carton Keychain");
    await expect(page.locator("body")).toContainText("Rs. 1,200");

    // Filter by search query
    const searchInput = page.getByPlaceholder(/Search products by title/i).first();
    await searchInput.fill("Strawberry");
    await expect(page.locator("body")).toContainText("Strawberry Milk Carton Keychain");

    // 6. Admin visits Bespoke Inquiries Queue
    await page.goto("/admin/inquiries");
    await expect(page.getByRole("heading", { name: /Bespoke Commission Inquiries/i })).toBeVisible();
    await expect(page.locator("body")).toContainText("Miniature Calico Cat Keepsake Sculpture");
    await expect(page.getByRole("link", { name: /Inspect →/i }).first()).toBeVisible();
  });
});

