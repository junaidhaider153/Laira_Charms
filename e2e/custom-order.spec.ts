import { test, expect } from "@playwright/test";

test.describe("Bespoke Custom Inquiry & Quotation Approval Lifecycle", () => {
  test("allows submitting custom inquiry form and renders reference confirmation", async ({ page }) => {
    await page.goto("/custom-order");

    await expect(page.locator("h1")).toContainText(/Handcrafted Miniature Art/i);

    // Fill Step 1: Concept & Brief
    await page.getByLabel(/Keepsake Concept Title/i).fill("Custom Persian Cat Miniature Charm");
    await page.getByLabel(/Detailed Sculpture Brief/i).fill(
      "Fluffy white Persian cat miniature in polymer clay with tiny pink nose, green eyes, and bell clasp."
    );

    // Fill Step 3: Contact Details
    await page.getByLabel(/Your Name/i).fill("Ayesha Noor");
    await page.locator("#customer-email").fill("ayesha@example.com");
    await page.getByLabel(/Pakistani Mobile Number/i).fill("03001234567");

    // Submit form
    const submitBtn = page.getByRole("button", { name: /Submit Bespoke Inquiry/i });
    await submitBtn.click();

    // Verify confirmation view
    await expect(page.locator("body")).toContainText(/Your Bespoke Concept is in Studio Review/i);
    await expect(page.locator("body")).toContainText(/Inquiry Reference Code/i);
    await expect(page.getByRole("link", { name: /Track Commission Status/i })).toBeVisible();
  });

  test("customer reviews active quotation and accepts commission", async ({ page }) => {
    const activeQuoteUrl =
      "/custom-order/quotes/44444444-4444-4444-4444-444444444401?token=sample-guest-token-123";

    await page.goto(activeQuoteUrl);

    // Verify quote presentation
    const card = page.getByTestId("quote-decision-card").first();
    await expect(card).toBeVisible();
    await expect(card).toContainText("Rs. 3,800");
    await expect(card).toContainText(/7 Studio Business Days/i);
    await expect(card).toContainText(/Hand-sculpted calico miniature/i);

    // Accept quotation if not yet accepted in prior browser test run
    const acceptBtn = card.getByRole("button", { name: /Accept Quotation & Lock Commission/i });
    if (await acceptBtn.isVisible()) {
      await expect(acceptBtn).toBeEnabled();
      await acceptBtn.click();
    }

    // Verify accepted state
    await expect(card).toContainText(/Quote Accepted/i);
    await expect(card).toContainText(/Your bespoke commission is officially locked in/i);
  });

  test("expired quotation locks acceptance action and shows expiration alert", async ({ page }) => {
    const expiredQuoteUrl =
      "/custom-order/quotes/44444444-4444-4444-4444-444444444402?token=sample-guest-token-123";

    await page.goto(expiredQuoteUrl);

    const card = page.getByTestId("quote-decision-card");
    await expect(card).toBeVisible();

    // Verify expiration indicator
    await expect(card).toContainText(/Quote Expired/i);

    // Accept button should be locked/disabled
    const lockedBtn = card.getByRole("button", { name: /Accept Locked \(Expired\)/i });
    await expect(lockedBtn).toBeDisabled();
  });
});
