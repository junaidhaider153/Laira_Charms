import { test, expect } from "@playwright/test";

test.describe("Fixed Customization Engine & Live Price Recalculation", () => {
  test("renders option selector, calculates live deltas, and validates required fields", async ({ page }) => {
    await page.goto("/products/custom-pastel-nameplate-keychain");

    // Customization engine should be visible
    const customizer = page.getByTestId("customization-engine").first();
    await expect(customizer).toBeVisible();

    // Verify initial base price is Rs. 1,800
    await expect(customizer).toContainText("Rs. 1,800");

    // Click "Add Custom Keepsake" without entering name -> should trigger validation
    const addBtn = customizer.getByRole("button", { name: /Add Custom Keepsake/i });
    await addBtn.click();

    // Validation alert should show
    const alert = customizer.getByRole("alert");
    await expect(alert).toContainText(/Custom Stamped Name is required/i);

    // Enter name "LAIRA"
    const nameInput = page.getByPlaceholder("e.g. LAIRA");
    await nameInput.fill("LAIRA");

    // Select Silver Heart Keychain Ring (+Rs. 50)
    const silverHeartOption = customizer.getByRole("button", { name: /Silver Heart Keychain Ring/i });
    await silverHeartOption.click();

    // Live price should update to Rs. 1,850
    await expect(customizer).toContainText("Rs. 1,850");

    // Now click Add Custom Keepsake
    await addBtn.click();

    // Cart drawer should open with customized item
    const drawer = page.getByRole("dialog", { name: /Shopping Bag/i });
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("LAIRA");
    await expect(drawer).toContainText("Rs. 1,850");

    // Dismiss drawer
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();
  });

  test("consolidates unique custom configurations as distinct items in cart", async ({ page }) => {
    await page.goto("/products/custom-pastel-nameplate-keychain");
    const customizer = page.getByTestId("customization-engine").first();

    // Item 1: "FATIMA" + Gold Star
    const nameInput = page.getByPlaceholder("e.g. LAIRA");
    await nameInput.fill("FATIMA");

    const addBtn = customizer.getByRole("button", { name: /Add Custom Keepsake/i });
    await addBtn.click();

    const drawer = page.getByRole("dialog", { name: /Shopping Bag/i });
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("FATIMA");
    await expect(drawer).toContainText("Your Charm Bag (1)");

    // Dismiss drawer
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();

    // Item 2: "AYESHA" + Rose Gold Lobster (+Rs. 100)
    await nameInput.fill("AYESHA");
    const roseGoldOption = customizer.getByRole("button", { name: /Rose Gold Lobster Hook/i });
    await roseGoldOption.click();

    await addBtn.click();

    // Drawer should now show 2 distinct items
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText("Your Charm Bag (2)");
    await expect(drawer).toContainText("FATIMA");
    await expect(drawer).toContainText("AYESHA");
    await expect(drawer).toContainText("Rs. 3,700"); // 1800 + 1900 = 3700
  });
});

