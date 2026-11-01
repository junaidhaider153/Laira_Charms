"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { Conversation, Message, MessageAttachment } from "@/lib/messaging/types";
import { sendMessageAction, toggleConversationStatusAction } from "@/lib/messaging/actions";

interface ChatThreadProps {
  conversation: Conversation;
  initialMessages: Message[];
  isAdmin?: boolean;
  guestToken?: string | null;
}

export function ChatThread({
  conversation: initialConv,
  initialMessages,
  isAdmin = false,
  guestToken,
}: ChatThreadProps) {
  const [conversation, setConversation] = useState<Conversation>(initialConv);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Attachment state
  const [pendingAttachments, setPendingAttachments] = useState<
    Array<{ fileName: string; mimeType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf"; sizeBytes: number; base64Data: string }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    const validMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

    Array.from(files).forEach((file) => {
      if (!validMimes.includes(file.type)) {
        setErrorMsg("Only JPG, PNG, WEBP, or PDF files are supported.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("Attachment exceeds 10 MB limit.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPendingAttachments((prev) => [
          ...prev,
          {
            fileName: file.name,
            mimeType: file.type as "image/jpeg" | "image/png" | "image/webp" | "application/pdf",
            sizeBytes: file.size,
            base64Data: base64,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && pendingAttachments.length === 0) return;
    if (conversation.isClosed) return;

    setIsSending(true);
    setErrorMsg(null);

    const visibility = isAdmin && isInternalNote ? "internal_admin_only" : "customer_and_admin";

    try {
      const result = await sendMessageAction({
        conversationId: conversation.id,
        body: inputText.trim() || (pendingAttachments.length > 0 ? "Shared attachment(s)" : ""),
        visibility,
        guestToken: guestToken || null,
        isAdminAction: isAdmin,
        attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
      });

      if (!result.success || !result.messageRecord) {
        setErrorMsg(result.message || "Failed to deliver message.");
        setIsSending(false);
        return;
      }

      setMessages((prev) => [...prev, result.messageRecord!]);
      setInputText("");
      setPendingAttachments([]);
      setIsInternalNote(false);
      setIsSending(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to deliver message.";
      setErrorMsg(msg);
      setIsSending(false);
    }
  };

  const handleToggleStatus = async () => {
    const targetClosed = !conversation.isClosed;
    const result = await toggleConversationStatusAction({
      conversationId: conversation.id,
      isClosed: targetClosed,
      guestToken: guestToken || null,
      isAdminAction: isAdmin,
    });

    if (result.success && result.conversation) {
      setConversation(result.conversation);
    }
  };

  return (
    <div className="flex flex-col h-[650px] max-w-4xl mx-auto rounded-3xl bg-surface-custard border border-border-warm shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border-warm bg-surface-cloud flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline font-bold text-base sm:text-lg text-espresso-deep">
              {conversation.title}
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                conversation.isClosed
                  ? "bg-surface-custard text-espresso-muted border border-border-warm"
                  : "bg-secondary/15 text-secondary border border-secondary/30"
              }`}
            >
              {conversation.isClosed ? "Resolved" : "Active Thread"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-espresso-muted mt-1">
            {conversation.contextId && (
              <span className="font-mono font-medium">Ref: {conversation.contextId}</span>
            )}
            <span>•</span>
            <span className="capitalize">{conversation.contextType.replace("_", " ")}</span>
          </div>
        </div>

        <button
          onClick={handleToggleStatus}
          type="button"
          className="px-3.5 py-1.5 rounded-xl border border-border-warm bg-surface-custard text-espresso-deep text-xs font-bold hover:bg-surface-cloud transition-colors whitespace-nowrap"
        >
          {conversation.isClosed ? "Reopen Thread" : "Mark Resolved"}
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-espresso-muted">
            <span className="text-3xl mb-2">💬</span>
            <p className="font-bold text-sm text-espresso-deep">No Messages Yet</p>
            <p className="text-xs mt-1">Send your first inquiry to start chatting with the studio.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isInternal = msg.visibility === "internal_admin_only";
            const isCustomer = msg.senderType === "customer";
            const dateStr = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            if (isInternal) {
              return (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2 max-w-xl mx-auto shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs border-b border-amber-200 pb-1.5">
                    <span className="font-bold flex items-center gap-1.5 text-amber-900">
                      <span>🔒</span> Studio Internal Note (Private to Admin)
                    </span>
                    <span className="text-amber-700 font-mono text-[11px]">{dateStr}</span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                  {renderAttachments(msg.attachments)}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isCustomer ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="font-bold text-xs text-espresso-deep">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-espresso-muted font-mono">{dateStr}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-md sm:max-w-lg text-xs leading-relaxed space-y-2 shadow-xs ${
                    isCustomer
                      ? "bg-peach-tint text-espresso-deep border border-primary/25 rounded-tr-none"
                      : "bg-surface-cloud text-espresso-deep border border-border-warm rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                  {renderAttachments(msg.attachments)}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer Area */}
      <div className="p-4 border-t border-border-warm bg-surface-cloud space-y-3">
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-error/10 border border-error/25 text-error text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {conversation.isClosed ? (
          <div className="p-3 rounded-2xl bg-surface-custard border border-border-warm text-center text-xs text-espresso-muted">
            This conversation is marked as resolved. Click <span className="font-bold text-espresso-deep">Reopen Thread</span> above to continue messaging.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-2.5">
            {/* Pending Attachments Strip */}
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-surface-custard border border-border-warm">
                {pendingAttachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-cloud border border-border-warm text-xs"
                  >
                    <span className="font-mono truncate max-w-[150px]">{att.fileName}</span>
                    <span className="text-[10px] text-espresso-muted">
                      ({Math.round(att.sizeBytes / 1024)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removePendingAttachment(idx)}
                      className="text-primary hover:text-red-700 font-bold ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Admin Internal Note Checkbox */}
            {isAdmin && (
              <label className="flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>🔒 Post as Studio Internal Note (Customer will NOT see this)</span>
              </label>
            )}

            <div className="flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                id="chatFileInput"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach design photo or screenshot"
                className="p-2.5 rounded-2xl bg-surface-custard border border-border-warm text-espresso-deep hover:bg-surface-container transition-colors text-sm"
              >
                📎
              </button>

              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={
                  isInternalNote
                    ? "Write an internal studio note (visible to admins only)..."
                    : "Type a message to the studio (Press Enter to send)..."
                }
                className={`flex-1 p-3 rounded-2xl border text-xs text-espresso-deep focus:outline-none focus:ring-2 resize-none ${
                  isInternalNote
                    ? "bg-amber-50/60 border-amber-300 focus:ring-amber-500"
                    : "bg-surface-custard border-border-warm focus:ring-primary"
                }`}
              />

              <button
                type="submit"
                disabled={isSending || (!inputText.trim() && pendingAttachments.length === 0)}
                className={`px-5 py-3 rounded-2xl font-bold text-xs text-white transition-all shadow-xs disabled:opacity-40 ${
                  isInternalNote
                    ? "bg-amber-700 hover:bg-amber-800"
                    : "bg-primary hover:bg-opacity-95"
                }`}
              >
                {isSending ? "Sending..." : isInternalNote ? "Save Note" : "Send"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function renderAttachments(attachments?: MessageAttachment[]) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1 border-t border-border-warm/40">
      {attachments.map((att) => {
        const isImage = att.mimeType.startsWith("image/");

        return (
          <div
            key={att.id}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-custard/60 border border-border-warm/60 text-[11px]"
          >
            {isImage && att.url ? (
              <a
                href={att.url}
                target="_blank"
                rel="noreferrer"
                className="relative w-10 h-10 rounded-lg overflow-hidden border border-border-warm block"
              >
                <Image
                  src={att.url}
                  alt={att.fileName}
                  fill
                  className="object-cover"
                />
              </a>
            ) : (
              <span className="text-base">📄</span>
            )}
            <div className="truncate max-w-[120px]">
              <span className="block font-mono truncate">{att.fileName}</span>
              <span className="text-[10px] text-espresso-muted">
                {Math.round(att.sizeBytes / 1024)} KB
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
