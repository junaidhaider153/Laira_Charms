import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatThread } from "./ChatThread";
import type { Conversation, Message } from "@/lib/messaging/types";

// Mock server action
vi.mock("@/lib/messaging/actions", () => ({
  sendMessageAction: vi.fn().mockImplementation(async (input) => ({
    success: true,
    message: "Delivered",
    messageRecord: {
      id: "msg-mock-new",
      conversationId: input.conversationId,
      senderId: null,
      senderType: "customer",
      senderName: "Customer",
      body: input.body,
      visibility: input.visibility || "customer_and_admin",
      isRead: false,
      attachments: [],
      createdAt: new Date().toISOString(),
    },
  })),
  toggleConversationStatusAction: vi.fn().mockImplementation(async (input) => ({
    success: true,
    message: "Updated",
    conversation: {
      id: input.conversationId,
      title: "Test Thread",
      contextType: "order",
      contextId: "LC-1234",
      customerId: null,
      guestEmail: "test@example.com",
      guestTokenHash: null,
      isClosed: input.isClosed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  })),
}));

const mockConversation: Conversation = {
  id: "conv-test-1",
  title: "Inquiry on Cherry Blossom",
  contextType: "order",
  contextId: "LC-20261031-7788",
  customerId: null,
  guestEmail: "ayesha@example.com",
  guestTokenHash: null,
  isClosed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockMessages: Message[] = [
  {
    id: "m1",
    conversationId: "conv-test-1",
    senderId: null,
    senderType: "customer",
    senderName: "Ayesha Noor",
    body: "Can I get extra gold foil accents?",
    visibility: "customer_and_admin",
    isRead: true,
    attachments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "m2",
    conversationId: "conv-test-1",
    senderId: "admin-1",
    senderType: "admin",
    senderName: "Studio Artisan (Internal)",
    body: "Dutch gold foil batch is ready in shelf A.",
    visibility: "internal_admin_only",
    isRead: true,
    attachments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "m3",
    conversationId: "conv-test-1",
    senderId: "admin-1",
    senderType: "admin",
    senderName: "✨ Laira Charms Studio",
    body: "Yes of course! We'll include the gold flakes.",
    visibility: "customer_and_admin",
    isRead: false,
    attachments: [],
    createdAt: new Date().toISOString(),
  },
];

describe("ChatThread Component", () => {
  it("renders messages and thread details for customer view", () => {
    // In customer view, the messages passed in are already filtered by the service
    const customerVisibleMessages = mockMessages.filter(
      (m) => m.visibility === "customer_and_admin"
    );

    render(
      <ChatThread
        conversation={mockConversation}
        initialMessages={customerVisibleMessages}
        isAdmin={false}
      />
    );

    expect(screen.getByText("Inquiry on Cherry Blossom")).toBeInTheDocument();
    expect(screen.getByText("Can I get extra gold foil accents?")).toBeInTheDocument();
    expect(screen.getByText("Yes of course! We'll include the gold flakes.")).toBeInTheDocument();

    // Internal note toggle must NOT exist for customers
    expect(
      screen.queryByText(/Post as Studio Internal Note/i)
    ).not.toBeInTheDocument();
  });

  it("renders internal note banner and checkbox for admin view", () => {
    render(
      <ChatThread
        conversation={mockConversation}
        initialMessages={mockMessages}
        isAdmin={true}
      />
    );

    // Admin should see internal note with lock indicator
    expect(screen.getByText(/Studio Internal Note \(Private to Admin\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Dutch gold foil batch is ready in shelf A/i)).toBeInTheDocument();

    // Admin should have the checkbox to post internal notes
    expect(
      screen.getByText(/Post as Studio Internal Note \(Customer will NOT see this\)/i)
    ).toBeInTheDocument();
  });

  it("submits message and renders optimistic message bubble", async () => {
    render(
      <ChatThread
        conversation={mockConversation}
        initialMessages={mockMessages.filter((m) => m.visibility === "customer_and_admin")}
        isAdmin={false}
      />
    );

    const textarea = screen.getByPlaceholderText(/Type a message to the studio/i);
    const sendButton = screen.getByRole("button", { name: "Send" });

    fireEvent.change(textarea, { target: { value: "Thank you so much!" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText("Thank you so much!")).toBeInTheDocument();
    });
  });
});
