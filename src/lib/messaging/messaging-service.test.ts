import { describe, it, expect } from "vitest";
import {
  getConversation,
  createConversation,
  sendMessage,
  toggleConversationStatus,
  markConversationAsRead,
  MEMORY_MESSAGES,
  SAMPLE_GUEST_CONV_ID,
  SAMPLE_GUEST_TOKEN,
} from "./messaging-service";

describe("Messaging Service & Internal Note Isolation", () => {
  const customerUserId = "cust-user-123";
  const otherCustomerUserId = "cust-user-999";

  it("CRITICAL: customer never receives internal admin notes", async () => {
    // When guest requests the sample thread with their valid token
    const result = await getConversation(SAMPLE_GUEST_CONV_ID, {
      guestToken: SAMPLE_GUEST_TOKEN,
      role: "customer",
    });

    expect(result).not.toBeNull();
    const messages = result!.messages;

    // Must contain customer message and studio reply
    expect(messages.some((m) => m.visibility === "customer_and_admin")).toBe(true);

    // MUST NOT contain the internal note
    const leakedNote = messages.find((m) => m.visibility === "internal_admin_only");
    expect(leakedNote).toBeUndefined();
    expect(
      messages.some((m) => m.body.includes("Dutch gold leaf sheets in stock"))
    ).toBe(false);
  });

  it("admin receives all messages including internal notes with correct visibility metadata", async () => {
    const result = await getConversation(SAMPLE_GUEST_CONV_ID, {
      role: "admin",
      userId: "admin-user-01",
    });

    expect(result).not.toBeNull();
    const messages = result!.messages;

    // Admin should see both public messages and internal notes
    const internalNote = messages.find((m) => m.visibility === "internal_admin_only");
    expect(internalNote).toBeDefined();
    expect(internalNote?.body).toContain("Dutch gold leaf sheets in stock");
  });

  it("blocks guest access when guest token is invalid or missing", async () => {
    // No token
    await expect(
      getConversation(SAMPLE_GUEST_CONV_ID, { role: "customer" })
    ).rejects.toThrow(/Unauthorized access/i);

    // Tampered token
    await expect(
      getConversation(SAMPLE_GUEST_CONV_ID, {
        role: "customer",
        guestToken: "invalid.tampered-token",
      })
    ).rejects.toThrow(/Unauthorized access/i);
  });

  it("enforces cross-customer authorization boundaries (IDOR prevention)", async () => {
    // 1. Create conversation belonging to customerUserId
    const { conversation } = await createConversation(
      {
        title: "Bespoke Charm Inquiry",
        contextType: "custom_request",
        initialMessage: "I would like a custom strawberry tart keychain.",
      },
      { userId: customerUserId, role: "customer" }
    );

    // 2. Owner customer can view it
    const ownerView = await getConversation(conversation.id, {
      userId: customerUserId,
      role: "customer",
    });
    expect(ownerView).not.toBeNull();

    // 3. Different customer is denied access
    await expect(
      getConversation(conversation.id, {
        userId: otherCustomerUserId,
        role: "customer",
      })
    ).rejects.toThrow(/Unauthorized access/i);
  });

  it("prevents customer from posting internal notes (forces customer_and_admin)", async () => {
    // Customer attempts to post with visibility: "internal_admin_only"
    const message = await sendMessage(
      {
        conversationId: SAMPLE_GUEST_CONV_ID,
        body: "Attempting to send as internal note",
        visibility: "internal_admin_only",
      },
      { guestToken: SAMPLE_GUEST_TOKEN, role: "customer" }
    );

    // Must be forced to customer_and_admin
    expect(message.visibility).toBe("customer_and_admin");
  });

  it("allows admin to post internal notes", async () => {
    const message = await sendMessage(
      {
        conversationId: SAMPLE_GUEST_CONV_ID,
        body: "Internal studio check: UV glaze oven rack 2 is operating at 135C.",
        visibility: "internal_admin_only",
      },
      { role: "admin", userId: "admin-user-01" }
    );

    expect(message.visibility).toBe("internal_admin_only");
  });

  it("validates attachment constraints (size and MIME type)", async () => {
    // Oversized attachment (>10MB)
    await expect(
      sendMessage(
        {
          conversationId: SAMPLE_GUEST_CONV_ID,
          body: "Sending oversized file",
          attachments: [
            {
              fileName: "huge_video.mp4",
              mimeType: "video/mp4" as unknown as "image/jpeg",
              sizeBytes: 15 * 1024 * 1024,
            },
          ],
        },
        { guestToken: SAMPLE_GUEST_TOKEN, role: "customer" }
      )
    ).rejects.toThrow();
  });

  it("blocks sending messages in closed conversations until reopened", async () => {
    // Close thread
    await toggleConversationStatus(SAMPLE_GUEST_CONV_ID, true, { role: "admin" });

    // Attempt to send message
    await expect(
      sendMessage(
        {
          conversationId: SAMPLE_GUEST_CONV_ID,
          body: "Trying to reply to closed thread",
        },
        { guestToken: SAMPLE_GUEST_TOKEN, role: "customer" }
      )
    ).rejects.toThrow(/thread is closed/i);

    // Reopen thread
    await toggleConversationStatus(SAMPLE_GUEST_CONV_ID, false, { role: "admin" });

    // Can now send message
    const msg = await sendMessage(
      {
        conversationId: SAMPLE_GUEST_CONV_ID,
        body: "Replying after reopen",
      },
      { guestToken: SAMPLE_GUEST_TOKEN, role: "customer" }
    );
    expect(msg.body).toBe("Replying after reopen");
  });

  it("marks unread messages as read correctly", async () => {
    await markConversationAsRead(SAMPLE_GUEST_CONV_ID, "admin");
    const msgs = MEMORY_MESSAGES.get(SAMPLE_GUEST_CONV_ID) || [];
    const customerMsg = msgs.find((m) => m.senderType === "customer");
    expect(customerMsg?.isRead).toBe(true);
  });
});
