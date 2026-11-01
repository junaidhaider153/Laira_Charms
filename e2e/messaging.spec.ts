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
    const internalNoteCheckbox = page.getByLabel(/Post as Studio Internal Note/i);
    await internalNoteCheckbox.check();

    const adminTextarea = page.getByPlaceholder(/Write an internal studio note/i);
    await adminTextarea.fill("Batch #4 clay shaped and baking at 130C in atelier oven.");

    const saveNoteBtn = page.getByRole("button", { name: /Save Note/i });
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

