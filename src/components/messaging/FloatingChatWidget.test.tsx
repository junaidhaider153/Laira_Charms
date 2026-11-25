import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FloatingChatWidget } from "./FloatingChatWidget";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: pushMock }),
}));

const createConversationActionMock = vi.fn();

vi.mock("@/lib/messaging/actions", () => ({
  createConversationAction: (...args: unknown[]) =>
    createConversationActionMock(...args),
}));

describe("FloatingChatWidget Dual-Mode Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    // jsdom doesn't implement scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens with AI Chat tab active by default alongside Email Inquiry tab", () => {
    render(<FloatingChatWidget />);

    fireEvent.click(screen.getByRole("button", { name: /Chat with studio atelier/i }));

    const aiTab = screen.getByRole("tab", { name: /AI Chat/i });
    const inquiryTab = screen.getByRole("tab", { name: /Email Inquiry/i });

    expect(aiTab).toHaveAttribute("aria-selected", "true");
    expect(inquiryTab).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText(/Assalam-o-Alaikum! I'm the Laira Studio Assistant/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Custom clay figure turnaround\?/i })).toBeInTheDocument();
  });

  it("sends quick prompt to /api/chat and renders streamed reply with clickable route link", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Custom pieces take 7-14 business days! Submit at /custom-order.", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );

    render(<FloatingChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Chat with studio atelier/i }));

    fireEvent.click(screen.getByRole("button", { name: /Custom clay figure turnaround\?/i }));

    await waitFor(() => {
      expect(screen.getByText(/Custom pieces take 7-14 business days!/i)).toBeInTheDocument();
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({ method: "POST" })
    );
    expect(screen.getByRole("link", { name: "/custom-order" })).toHaveAttribute(
      "href",
      "/custom-order"
    );

    // Reset chat clears history and restores quick prompts
    fireEvent.click(screen.getByRole("button", { name: /Reset chat/i }));
    expect(screen.queryByText(/Custom pieces take 7-14 business days!/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Custom clay figure turnaround\?/i })).toBeInTheDocument();
  });

  it("shows graceful fallback on 503 and pre-fills Email Inquiry on handoff click", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Laira Studio AI Assistant is currently offline.",
          fallbackToInquiry: true,
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      )
    );

    render(<FloatingChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Chat with studio atelier/i }));

    const input = screen.getByLabelText(/Message Laira Studio Assistant/i);
    fireEvent.change(input, { target: { value: "Can you sculpt my cat?" } });
    fireEvent.click(screen.getByRole("button", { name: /Send message to AI assistant/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /Laira Studio AI Assistant is currently offline/i
      );
    });

    // Click fallback CTA inside alert
    fireEvent.click(screen.getByRole("button", { name: /Switch to Email Inquiry →/i }));

    const questionField = screen.getByLabelText(/Your Question/i) as HTMLTextAreaElement;
    expect(questionField.value).toBe("Can you sculpt my cat?");
  });

  it("preserves full Email Inquiry submission flow", async () => {
    createConversationActionMock.mockResolvedValue({
      success: true,
      conversation: { id: "conv-123" },
      guestToken: "tok-abc",
    });

    render(<FloatingChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Chat with studio atelier/i }));
    fireEvent.click(screen.getByRole("tab", { name: /Email Inquiry/i }));

    fireEvent.change(screen.getByLabelText(/Your Email/i), {
      target: { value: "collector@example.pk" },
    });
    fireEvent.change(screen.getByLabelText(/Your Question/i), {
      target: { value: "Please quote a custom pet charm." },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send Inquiry/i }));

    await waitFor(() => {
      expect(createConversationActionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          guestEmail: "collector@example.pk",
          initialMessage: "Please quote a custom pet charm.",
        })
      );
      expect(pushMock).toHaveBeenCalledWith("/conversations/conv-123?token=tok-abc");
    });
  });
});
