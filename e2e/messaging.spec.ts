import { test, expect } from "@playwright/test";
import { generateGuestToken } from "../src/lib/auth/guest-token";

test.describe("Realtime Website Messaging & Internal Note Isolation Flow", () => {
  const sampleOrderRef = "LC-20261031-7788";
  const sampleGuestEmail = "ayesha@example.com";
  const { token: sampleGuestToken } = generateGuestToken(sampleOrderRef, sampleGuestEmail);

  test("customer chats with studio, and internal admin notes are strictly isolated", async ({
    page,
  }) => {
    // 1. Customer visits their order tracking page with guest token
    await page.goto(`/orders/${sampleOrderRef}?token=${encodeURIComponent(sampleGuestToken)}`);

    // 2. Verify messaging section exists
    await expect(page.locator("body")).toContainText("Artisanal Studio Messages & Craft Inquiries");
    await expect(page.locator("body")).toContainText("Can I confirm if my Cherry Blossom charm can include golden foil accents");

    // 3. Verify public studio reply is visible to the customer
    await expect(page.locator("body")).toContainText("Walaikum Assalam Ayesha! Yes absolutely");

    // 4. CRITICAL SECURITY CHECK: Internal note MUST NOT leak to the customer
    await expect(page.locator("body")).not.toContainText("Dutch gold leaf sheets in stock");
    await expect(page.locator("body")).not.toContainText("Studio Internal Note");
    await expect(page.locator("body")).not.toContainText("Post as Studio Internal Note");

    // 5. Customer posts a reply to the studio
    const chatTextarea = page.getByPlaceholder(/Type a message to the studio/i);
    await chatTextarea.fill("Thank you so much! Please proceed with the gold foil.");

    const sendBtn = page.getByRole("button", { name: "Send" });
    await sendBtn.click();

    // Verify customer's new message appears in the chat stream
    await expect(page.locator("body")).toContainText("Thank you so much! Please proceed with the gold foil.");

    // 6. Admin navigates to Studio Inbox
    await page.goto("/admin/conversations");
    await expect(page.locator("h1").first()).toContainText(/Studio Inbox & Inquiries/i);
    await expect(page.locator("body")).toContainText("Inquiry on Order LC-20261031-7788");

    // 7. Verify admin sees both public messages AND the internal note
    await expect(page.locator("body")).toContainText("Can I confirm if my Cherry Blossom charm can include golden foil accents");
    await expect(page.locator("body")).toContainText("Studio Internal Note (Private to Admin)");
    await expect(page.locator("body")).toContainText("Dutch gold leaf sheets in stock");

    // 8. Admin posts an internal note
    const internalNoteCheckbox = page.getByLabel(/Post as Studio Internal Note/i).first();
    await internalNoteCheckbox.check();

    const adminTextarea = page.getByPlaceholder(/Write an internal studio note/i).first();
    await adminTextarea.fill("Batch #4 clay shaped and baking at 130C in atelier oven.");

    const saveNoteBtn = page.getByRole("button", { name: /Save Note/i }).first();
    await saveNoteBtn.click();

    // Verify admin sees the new internal note with amber badge
    await expect(page.locator("body")).toContainText("Batch #4 clay shaped and baking at 130C in atelier oven.");

    // 9. Customer refreshes order page — verify customer STILL cannot see the internal note
    await page.goto(`/orders/${sampleOrderRef}?token=${encodeURIComponent(sampleGuestToken)}`);
    await expect(page.locator("body")).toContainText("Artisanal Studio Messages & Craft Inquiries");
    await expect(page.locator("body")).not.toContainText("Batch #4 clay shaped and baking at 130C in atelier oven.");
    await expect(page.locator("body")).not.toContainText("Dutch gold leaf sheets in stock");
  });
});

test.describe("FloatingChatWidget Dual-Mode AI + Email Inquiry Flow", () => {
  test("supports AI chat replies, handoff prefill, and Email Inquiry submission", async ({
    page,
  }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body: "Custom clay figures take 7 to 14 business days. Visit /custom-order to request a quote!",
      });
    });

    await page.goto("/");

    // 1. Open floating chat widget
    await page.getByRole("button", { name: /Chat with studio atelier/i }).click();

    // 2. Verify both AI Chat and Email Inquiry tabs exist with AI Chat default active
    const aiTab = page.getByRole("tab", { name: /AI Chat/i });
    const inquiryTab = page.getByRole("tab", { name: /Email Inquiry/i });
    await expect(aiTab).toHaveAttribute("aria-selected", "true");
    await expect(inquiryTab).toHaveAttribute("aria-selected", "false");

    // 3. Send a message in AI Chat and verify mocked assistant reply
    const aiInput = page.getByLabel(/Message Laira Studio Assistant/i);
    await aiInput.fill("Custom clay figure turnaround?");
    await page.getByRole("button", { name: /Send message to AI assistant/i }).click();

    await expect(page.locator("[role='dialog']")).toContainText(
      "Custom clay figures take 7 to 14 business days."
    );

    // 4. Click human handoff CTA to switch to Email Inquiry with pre-filled context
    await page
      .getByRole("button", { name: /Need a custom quote or human reply\? Switch to Email Inquiry/i })
      .click();

    await expect(inquiryTab).toHaveAttribute("aria-selected", "true");
    const questionBox = page.getByLabel(/Your Question/i);
    await expect(questionBox).toHaveValue("Custom clay figure turnaround?");

    // 5. Complete Email Inquiry submission and confirm conversation flow works
    await page.getByLabel(/Your Email/i).fill("e2e-collector@example.pk");
    await page.getByRole("button", { name: /Send Inquiry/i }).click();

    await page.waitForURL(/\/conversations\//);
    await expect(page.locator("body")).toContainText("Custom clay figure turnaround?");
  });
});

