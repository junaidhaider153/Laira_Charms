"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { createConversationAction } from "@/lib/messaging/actions";

interface StoredConversation {
  id: string;
  guestToken?: string | null;
}

const STORAGE_KEY = "laira_last_conversation";

export function FloatingChatWidget() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previousChat, setPreviousChat] = useState<StoredConversation | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Check localStorage for prior guest conversation
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
      ? `/conversations/${previousChat.id}?token=${encodeURIComponent(previousChat.guestToken)}`
      : `/conversations/${previousChat.id}`;
    setIsOpen(false);
    router.push(targetUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        setErrorMessage(result.message || "Failed to start chat. Please try again.");
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
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

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
              <Icon name="chat" className="text-[26px] group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-peach-tint opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Chat Dialog Modal */}
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Ask Atelier Studio"
          className="fixed bottom-24 right-6 z-40 w-[90vw] max-w-sm bg-surface-cloud rounded-3xl shadow-2xl border border-border-warm overflow-hidden animate-fadeIn"
        >
          {/* Header */}
          <div className="bg-surface-custard px-5 py-4 border-b border-border-warm flex items-center justify-between">
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

          <div className="p-5 space-y-4">
            {/* Returning Visitor Shortcut */}
            {previousChat && (
              <div className="bg-peach-tint/60 rounded-2xl p-3 border border-border-warm/50 flex items-center justify-between gap-2">
                <div className="text-xs text-espresso-deep">
                  <span className="font-bold block">Previous Inquiry</span>
                  <span className="text-[11px] text-espresso-muted">Continue your existing thread</span>
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
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Honeypot field for bot spam prevention */}
              <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
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
                    <Icon name="send" className="text-[14px]" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

