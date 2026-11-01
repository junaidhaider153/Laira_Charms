import { test, expect } from "@playwright/test";

test.describe("Admin Order Lifecycle & Fulfillment Dashboard", () => {
  const sampleOrderRef = "LC-20261031-7788";

  test("admin views orders queue, filters by status, inspects order, and advances status", async ({
    page,
  }) => {
    // 1. Visit admin orders queue dashboard
    await page.goto("/admin/orders");

    // 2. Verify page headline and summary tabs
    await expect(page.locator("h1")).toContainText(/Studio Orders Queue/i);
    await expect(page.getByRole("button", { name: /All Orders/i })).toBeVisible();

    // 3. Verify sample order exists in the table
    await expect(page.locator("body")).toContainText(sampleOrderRef);
    await expect(page.locator("body")).toContainText("Ayesha Noor");
    await expect(page.locator("body")).toContainText("Rs. 2,650");

    // 4. Test filter search input
    const searchInput = page.getByPlaceholder(/Search by reference/i);
    await searchInput.fill(sampleOrderRef);
    await expect(page.locator("body")).toContainText(sampleOrderRef);

    // Filter with non-matching query
    await searchInput.fill("NON_EXISTENT_REF_99999");
    await expect(page.locator("body")).toContainText(/No Orders Found in This Queue/i);

    // Clear search filter
    await searchInput.fill("");
    await expect(page.locator("body")).toContainText(sampleOrderRef);

    // 5. Click "Manage" link to navigate to order inspection view
    const manageLink = page.getByRole("link", { name: /Manage →/i }).first();
    await manageLink.click();

    // 6. Verify order details on inspection page
    await expect(page.locator("h1")).toContainText(sampleOrderRef);
    await expect(page.locator("body")).toContainText("Ayesha Noor");
    await expect(page.locator("body")).toContainText("House 14-B, Street 3, Sector F-7/1");
    await expect(page.locator("body")).toContainText("Cherry Blossom Bloom Charm");
    await expect(page.locator("body")).toContainText("Order Lifecycle Progression");

    // 7. Advance order status using state machine select
    const statusSelect = page.locator("#targetStatus");
    await expect(statusSelect).toBeVisible();

    // Select awaiting_verification
    await statusSelect.selectOption("awaiting_verification");

    const noteInput = page.locator("#statusNote");
    await noteInput.fill("Customer submitted proof via Meezan bank transfer.");

    // Submit status change
    const updateBtn = page.getByRole("button", { name: /Advance Order to/i });
    await updateBtn.click();

    // 8. Confirm state transition success banner and updated status
    await expect(page.locator("body")).toContainText(/Order status advanced to awaiting_verification/i);
    await expect(page.locator("body")).toContainText("Verification Pending");
  });
});
