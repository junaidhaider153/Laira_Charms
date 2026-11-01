import { test, expect } from "@playwright/test";
import { generateGuestToken } from "../src/lib/auth/guest-token";

test.describe("Manual Bank Transfer & Proof Verification Flow", () => {
  const sampleOrderRef = "LC-20261031-7788";
  const sampleGuestEmail = "ayesha@example.com";
  const { token: sampleGuestToken } = generateGuestToken(sampleOrderRef, sampleGuestEmail);

  test("customer views bank details, submits transfer screenshot, and enters verification_pending state", async ({
    page,
  }) => {
    // 1. Navigate to payment instructions page with valid guest token
    await page.goto(`/payment/${sampleOrderRef}?token=${encodeURIComponent(sampleGuestToken)}`);

    await expect(page.locator("h1")).toContainText(/Payment & Verification/i);
    await expect(page.locator("body")).toContainText(sampleOrderRef);

    // 2. Verify all 3 Pakistani payment channels are displayed
    await expect(page.locator("body")).toContainText("Meezan Bank Limited");
    await expect(page.locator("body")).toContainText("EasyPaisa");
    await expect(page.locator("body")).toContainText("JazzCash");

    // 3. Select Meezan Bank and fill sender details
    await page.locator("#senderName").fill("Ayesha Noor");
    await page.locator("#transactionId").fill("TXN-MEEZAN-889900");

    // 4. Attach a dummy screenshot
    await page.locator("#proofFile").setInputFiles({
      name: "meezan_receipt.png",
      mimeType: "image/png",
      buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"),
    });

    // 5. Submit proof form
    const submitBtn = page.getByRole("button", {
      name: /Submit Payment Proof for Studio Review/i,
    });
    await submitBtn.click();

    // 6. Verify transition to verification_pending review state
    await expect(page.locator("body")).toContainText(/Payment Proof Received/i);
    await expect(page.locator("body")).toContainText(/Under Studio Review/i);
    await expect(page.locator("body")).toContainText("TXN-MEEZAN-889900");
  });

  test("blocks unauthenticated guest access without guest token", async ({ page }) => {
    await page.goto(`/payment/${sampleOrderRef}`);

    // Should return 404
    await expect(page.locator("body")).toContainText(/404/i);
  });
});

