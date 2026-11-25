"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { createConversationAction } from "@/lib/messaging/actions";

interface StoredConversation {
  id: string;
  guestToken?: string | null;
}

interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type WidgetTab = "ai" | "inquiry";

const STORAGE_KEY = "laira_last_conversation";
const AI_SESSION_KEY = "laira_ai_chat_history";

const WELCOME_MESSAGE: AiChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Assalam-o-Alaikum! I'm the Laira Studio Assistant. Ask me about our polymer clay charms, custom atelier turnaround times, delivery across Pakistan, or payments.",
};

const QUICK_PROMPTS = [
  "Custom clay figure turnaround?",
  "How do custom orders work?",
  "Delivery across Pakistan",
  "Returns & payment details",
];

/**
 * Safely renders markdown links `[label](/path)` and bare internal store routes (`/shop`, `/custom-order`, etc.)
 * as clickable Next.js Links without dangerouslySetInnerHTML.
 */
function renderMessageContent(
  text: string,
  onLinkClick: () => void
): React.ReactNode {
  const tokenRegex =
    /(\[[^\]]+\]\(\/[a-zA-Z0-9\-_/?=&]+\)|(?<![a-zA-Z0-9/])\/(?:shop|custom-order|faq|shipping|returns|contact|cart|categories\/[a-zA-Z0-9\-_]+|products\/[a-zA-Z0-9\-_]+))/g;

  const parts = text.split(tokenRegex);
  return parts.map((part, idx) => {
    const mdMatch = /^\[([^\]]+)\]\((\/[a-zA-Z0-9\-_/?=&]+)\)$/.exec(part);
    if (mdMatch) {
      return (
        <Link
          key={idx}
          href={mdMatch[2]}
          onClick={onLinkClick}
          className="font-semibold text-strawberry-blush-dark underline hover:text-espresso-deep transition-colors"
        >
          {mdMatch[1]}
        </Link>
      );
    }
    if (part.startsWith("/")) {
      return (
        <Link
          key={idx}
          href={part}
          onClick={onLinkClick}
          className="font-semibold text-strawberry-blush-dark underline hover:text-espresso-deep transition-colors"
        >
          {part}
        </Link>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function FloatingChatWidget() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WidgetTab>("ai");

  // Email Inquiry state (existing flow)
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previousChat, setPreviousChat] = useState<StoredConversation | null>(
    null
  );

  // AI Assistant state
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>([
    WELCOME_MESSAGE,
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiFallbackMessage, setAiFallbackMessage] = useState<string | null>(
    null
  );

  const dialogRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const aiTabRef = useRef<HTMLButtonElement>(null);
  const inquiryTabRef = useRef<HTMLButtonElement>(null);

  // Restore localStorage previous email thread & sessionStorage AI chat history
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredConversation = JSON.parse(stored);
        if (parsed?.id) {
          setPreviousChat(parsed);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }

    try {
      const storedAi = sessionStorage.getItem(AI_SESSION_KEY);
      if (storedAi) {
        const parsedAi: AiChatMessage[] = JSON.parse(storedAi);
        if (Array.isArray(parsedAi) && parsedAi.length > 0) {
          setAiMessages(parsedAi);
        }
      }
    } catch {
      // Ignore sessionStorage read errors
    }
  }, []);

  // Persist AI messages across navigation in sessionStorage
  useEffect(() => {
    try {
      if (aiMessages.length > 1) {
        sessionStorage.setItem(AI_SESSION_KEY, JSON.stringify(aiMessages));
      }
    } catch {
      // Ignore sessionStorage quota/access errors
    }
  }, [aiMessages]);

  // Auto-scroll newest AI chat message into view
  useEffect(() => {
    if (isOpen && activeTab === "ai") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages, isStreaming, isOpen, activeTab]);

  // Abort any in-flight AI request on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Handle Escape key to close dialog
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Hide on admin portal, conversations, and order fulfillment pages
  if (
    !pathname ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/conversations") ||
    pathname.startsWith("/orders")
  ) {
    return null;
  }

  const handleContinuePrevious = () => {
    if (!previousChat?.id) return;
    const targetUrl = previousChat.guestToken
      ? `/conversations/${previousChat.id}?token=${encodeURIComponent(
          previousChat.guestToken
        )}`
      : `/conversations/${previousChat.id}`;
    setIsOpen(false);
    router.push(targetUrl);
  };

  const handleResetAiChat = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setAiFallbackMessage(null);
    setAiMessages([WELCOME_MESSAGE]);
    try {
      sessionStorage.removeItem(AI_SESSION_KEY);
    } catch {
      // Ignore
    }
  };

  const handleHandoffToInquiry = () => {
    const userMessages = aiMessages.filter((m) => m.role === "user");
    if (!question.trim() && userMessages.length > 0) {
      if (userMessages.length === 1) {
        setQuestion(userMessages[0].content);
      } else {
        const lastQuestion = userMessages[userMessages.length - 1].content;
        const summaryContext = userMessages
          .slice(-3)
          .map((m) => `- ${m.content}`)
          .join("\n");
        setQuestion(
          `From AI Chat:\n${lastQuestion}\n\nRecent questions:\n${summaryContext}`
        );
      }
    }
    setActiveTab("inquiry");
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key === "ArrowRight" ||
      e.key === "ArrowLeft" ||
      e.key === "Home" ||
      e.key === "End"
    ) {
      e.preventDefault();
      const nextTab: WidgetTab =
        e.key === "Home"
          ? "ai"
          : e.key === "End"
          ? "inquiry"
          : activeTab === "ai"
          ? "inquiry"
          : "ai";
      setActiveTab(nextTab);
      if (nextTab === "ai") {
        aiTabRef.current?.focus();
      } else {
        inquiryTabRef.current?.focus();
      }
    }
  };

  const sendAiMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isStreaming) return;

    setAiFallbackMessage(null);
    setAiInput("");

    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const nextHistory = [...aiMessages, userMsg];
    const assistantMsgId = `assistant-${Date.now()}`;
    setAiMessages([
      ...nextHistory,
      { id: assistantMsgId, role: "assistant", content: "" },
    ]);
    setIsStreaming(true);

    // Send only real user/assistant turns (skip static welcome prompt), capped at 12
    const payloadMessages = nextHistory
      .filter((m) => m.id !== WELCOME_MESSAGE.id)
      .slice(-12)
      .map(({ role, content }) => ({ role, content }));

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let fallbackMsg =
          "AI Assistant is currently unavailable. Switch to Email Inquiry so our studio team can reply directly.";
        try {
          const errData = (await response.json()) as { error?: string };
          if (errData?.error) {
            fallbackMsg = errData.error;
          }
        } catch {
          // Keep friendly default fallback message
        }

        // Remove empty assistant placeholder message
        setAiMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
        setAiFallbackMessage(fallbackMsg);
        setIsStreaming(false);
        return;
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = (await response.json()) as {
          reply?: string;
          message?: string;
          content?: string;
        };
        const replyText =
          json.reply ||
          json.message ||
          json.content ||
          "Please switch to Email Inquiry for further help!";
        setAiMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: replyText } : m
          )
        );
      } else if (response.body && typeof response.body.getReader === "function") {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const snapshot = accumulated;
          setAiMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: snapshot } : m
            )
          );
        }

        accumulated += decoder.decode();
        if (!accumulated.trim()) {
          setAiMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
          setAiFallbackMessage(
            "We couldn't generate a response right now. Switch to Email Inquiry for a direct human reply."
          );
        }
      } else {
        const textReply = await response.text();
        if (textReply.trim()) {
          setAiMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: textReply } : m
            )
          );
        } else {
          setAiMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
          setAiFallbackMessage(
            "We couldn't generate a response right now. Switch to Email Inquiry for a direct human reply."
          );
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setAiMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
      setAiFallbackMessage(
        "Unable to reach Laira Studio AI right now. Switch to Email Inquiry for a direct studio response."
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleAiFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendAiMessage(aiInput);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    const trimmedQuestion = question.trim();

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address so we can reply.");
      return;
    }
    if (!trimmedQuestion || trimmedQuestion.length < 5) {
      setErrorMessage("Please type your question (at least 5 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createConversationAction({
        title: "Pre-order question",
        contextType: "general",
        guestEmail: trimmedEmail,
        initialMessage: trimmedQuestion,
        websiteHp: honeypot,
      });

      if (!result.success || !result.conversation) {
        setErrorMessage(
          result.message || "Failed to start chat. Please try again."
        );
        setIsSubmitting(false);
        return;
      }

      const convId = result.conversation.id;
      const guestToken = result.guestToken || null;

      // Save to localStorage for returning visitors
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ id: convId, guestToken })
        );
      } catch {
        // Safe fallback if storage blocked
      }

      setIsOpen(false);
      const targetUrl = guestToken
        ? `/conversations/${convId}?token=${encodeURIComponent(guestToken)}`
        : `/conversations/${convId}`;

      router.push(targetUrl);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  const hasCustomerMessages = aiMessages.some((m) => m.role === "user");

  return (
    <>
      {/* Floating Trigger Button (z-40, positioned bottom-right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-14 h-14 rounded-full bg-strawberry-blush text-white shadow-xl hover:bg-strawberry-blush-dark transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-95 focus:outline-none focus:ring-4 focus:ring-strawberry-blush/30 group"
          aria-label={isOpen ? "Close studio chat" : "Chat with studio atelier"}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          {isOpen ? (
            <Icon name="close" className="text-[24px]" aria-hidden="true" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Icon
                name="chat"
                className="text-[26px] group-hover:scale-110 transition-transform"
                aria-hidden="true"
              />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-peach-tint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Dual-Mode Chat Dialog Modal */}
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Laira Studio Chat"
          className="fixed bottom-24 right-4 sm:right-6 z-40 w-[92vw] max-w-sm bg-surface-cloud rounded-3xl shadow-2xl border border-border-warm overflow-hidden animate-fadeIn flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="bg-surface-custard px-5 py-4 border-b border-border-warm flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-strawberry-subtle flex items-center justify-center text-strawberry-blush">
                <Icon name="pets" className="text-[18px]" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm text-espresso-deep leading-tight">
                  Laira Studio Chat
                </h3>
                <p className="font-label-sm text-[11px] text-espresso-muted">
                  Ask about custom orders &amp; charms
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-surface-cloud text-espresso-muted hover:text-espresso-deep flex items-center justify-center shadow-xs cursor-pointer"
              aria-label="Close dialog"
            >
              <Icon name="close" className="text-[16px]" aria-hidden="true" />
            </button>
          </div>

          {/* Two-Tab Segmented Control */}
          <div className="bg-surface-custard/60 px-4 py-2 border-b border-border-warm shrink-0">
            <div
              role="tablist"
              aria-label="Chat modes"
              onKeyDown={handleTabKeyDown}
              className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface-container border border-border-warm/60"
            >
              <button
                ref={aiTabRef}
                id="tab-ai-chat"
                type="button"
                role="tab"
                aria-selected={activeTab === "ai"}
                aria-controls="panel-ai-chat"
                tabIndex={activeTab === "ai" ? 0 : -1}
                onClick={() => setActiveTab("ai")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "ai"
                    ? "bg-surface-cloud text-espresso-deep shadow-xs"
                    : "text-espresso-muted hover:text-espresso-deep"
                }`}
              >
                <Icon
                  name="auto_awesome"
                  className={`text-[14px] ${
                    activeTab === "ai"
                      ? "text-strawberry-blush"
                      : "text-espresso-muted"
                  }`}
                  aria-hidden="true"
                />
                <span>AI Chat</span>
              </button>

              <button
                ref={inquiryTabRef}
                id="tab-email-inquiry"
                type="button"
                role="tab"
                aria-selected={activeTab === "inquiry"}
                aria-controls="panel-email-inquiry"
                tabIndex={activeTab === "inquiry" ? 0 : -1}
                onClick={() => setActiveTab("inquiry")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "inquiry"
                    ? "bg-surface-cloud text-espresso-deep shadow-xs"
                    : "text-espresso-muted hover:text-espresso-deep"
                }`}
              >
                <Icon
                  name="mail"
                  className={`text-[14px] ${
                    activeTab === "inquiry"
                      ? "text-strawberry-blush"
                      : "text-espresso-muted"
                  }`}
                  aria-hidden="true"
                />
                <span>Email Inquiry</span>
              </button>
            </div>
          </div>

          {/* TAB 1: AI CHAT */}
          {activeTab === "ai" && (
            <div
              id="panel-ai-chat"
              role="tabpanel"
              aria-labelledby="tab-ai-chat"
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Sub-header with Reset Chat */}
              {hasCustomerMessages && (
                <div className="px-4 py-1.5 border-b border-border-warm/50 bg-canvas-butter/50 flex items-center justify-between text-[11px] shrink-0">
                  <span className="text-espresso-muted font-medium">
                    Instant Studio Help
                  </span>
                  <button
                    type="button"
                    onClick={handleResetAiChat}
                    className="inline-flex items-center gap-1 text-espresso-muted hover:text-strawberry-blush-dark font-semibold transition-colors cursor-pointer"
                  >
                    <Icon
                      name="refresh"
                      className="text-[13px]"
                      aria-hidden="true"
                    />
                    <span>Reset chat</span>
                  </button>
                </div>
              )}

              {/* Scrollable Messages Container */}
              <div
                className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 min-h-[210px] max-h-[300px]"
                aria-live="polite"
              >
                {aiMessages.map((msg) => {
                  const isUser = msg.role === "user";
                  const isPlaceholderTyping =
                    !isUser && !msg.content && isStreaming;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        isUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? "bg-strawberry-blush text-white rounded-br-xs"
                            : "bg-surface-custard text-espresso-deep border border-border-warm/60 rounded-bl-xs"
                        }`}
                      >
                        {isPlaceholderTyping ? (
                          <span className="inline-flex items-center gap-1 text-espresso-muted italic">
                            <span className="w-1.5 h-1.5 rounded-full bg-strawberry-blush animate-pulse" />
                            <span>Studio Assistant is typing...</span>
                          </span>
                        ) : isUser ? (
                          msg.content
                        ) : (
                          renderMessageContent(msg.content, () =>
                            setIsOpen(false)
                          )
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Clickable Quick Prompts */}
                {!hasCustomerMessages && !isStreaming && (
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendAiMessage(prompt)}
                        className="text-[11px] font-medium text-espresso-deep bg-surface-container hover:bg-strawberry-subtle hover:text-strawberry-blush-dark border border-border-warm/70 rounded-xl px-2.5 py-1.5 transition-colors text-left cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Graceful Fallback Notice */}
                {aiFallbackMessage && (
                  <div
                    role="alert"
                    className="p-3 rounded-2xl bg-surface-container border border-border-warm text-xs text-espresso-deep space-y-2"
                  >
                    <p className="leading-relaxed text-[11px]">
                      {aiFallbackMessage}
                    </p>
                    <button
                      type="button"
                      onClick={handleHandoffToInquiry}
                      className="w-full py-2 px-3 rounded-xl bg-strawberry-blush text-white font-bold text-[11px] hover:bg-strawberry-blush-dark transition-colors cursor-pointer"
                    >
                      Switch to Email Inquiry &rarr;
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* AI Prompt Input & Human Handoff Link */}
              <div className="p-4 pt-3 border-t border-border-warm bg-surface-cloud space-y-2.5 shrink-0">
                <form
                  onSubmit={handleAiFormSubmit}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    disabled={isStreaming}
                    maxLength={1000}
                    placeholder="Ask about charms, turnaround, shipping..."
                    aria-label="Message Laira Studio Assistant"
                    className="flex-1 bg-surface-container border border-border-warm rounded-xl px-3 py-2 text-xs text-espresso-deep placeholder:text-espresso-muted/65 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isStreaming || !aiInput.trim()}
                    aria-label="Send message to AI assistant"
                    className="w-9 h-9 rounded-xl bg-strawberry-blush text-white hover:bg-strawberry-blush-dark transition-colors flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    <Icon
                      name="send"
                      className="text-[16px]"
                      aria-hidden="true"
                    />
                  </button>
                </form>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleHandoffToInquiry}
                    className="text-[11px] text-espresso-muted hover:text-strawberry-blush-dark font-medium underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Need a custom quote or human reply? Switch to Email Inquiry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL INQUIRY (Existing flow intact) */}
          {activeTab === "inquiry" && (
            <div
              id="panel-email-inquiry"
              role="tabpanel"
              aria-labelledby="tab-email-inquiry"
              className="p-5 space-y-4 overflow-y-auto"
            >
              {/* Returning Visitor Shortcut */}
              {previousChat && (
                <div className="bg-peach-tint/60 rounded-2xl p-3 border border-border-warm/50 flex items-center justify-between gap-2">
                  <div className="text-xs text-espresso-deep">
                    <span className="font-bold block">Previous Inquiry</span>
                    <span className="text-[11px] text-espresso-muted">
                      Continue your existing thread
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleContinuePrevious}
                    className="px-3 py-1.5 rounded-full bg-white text-espresso-deep text-xs font-bold hover:bg-surface-custard transition-colors shadow-xs shrink-0 cursor-pointer"
                  >
                    Continue &rarr;
                  </button>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 font-medium"
                >
                  {errorMessage}
                </div>
              )}

              {/* Inquiry Form */}
              <form onSubmit={handleInquirySubmit} className="space-y-3">
                {/* Honeypot field for bot spam prevention */}
                <div
                  className="hidden"
                  aria-hidden="true"
                  style={{ display: "none" }}
                >
                  <label htmlFor="chat-company">Company</label>
                  <input
                    id="chat-company"
                    type="text"
                    name="websiteHp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="chat-email"
                    className="block text-xs font-semibold text-espresso-deep mb-1"
                  >
                    Your Email <span className="text-primary">*</span>
                  </label>
                  <input
                    id="chat-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.pk"
                    className="w-full bg-surface-container border border-border-warm rounded-xl px-3 py-2 text-xs text-espresso-deep placeholder:text-espresso-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="chat-question"
                    className="block text-xs font-semibold text-espresso-deep mb-1"
                  >
                    Your Question <span className="text-primary">*</span>
                  </label>
                  <textarea
                    id="chat-question"
                    required
                    rows={3}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about custom clay figures, turnaround times, or delivery..."
                    className="w-full bg-surface-container border border-border-warm rounded-xl px-3 py-2 text-xs text-espresso-deep placeholder:text-espresso-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-strawberry-blush text-white text-xs font-bold hover:bg-strawberry-blush-dark transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Sending inquiry...</span>
                  ) : (
                    <>
                      <span>Send Inquiry</span>
                      <Icon
                        name="send"
                        className="text-[14px]"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
