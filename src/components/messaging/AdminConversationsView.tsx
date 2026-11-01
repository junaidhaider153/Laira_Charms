"use client";

import React, { useState } from "react";
import type { Conversation, Message } from "@/lib/messaging/types";
import { ChatThread } from "./ChatThread";

interface AdminConversationsViewProps {
  conversations: Conversation[];
  initialSelectedId?: string;
  initialMessagesMap: Record<string, Message[]>;
}

export function AdminConversationsView({
  conversations,
  initialSelectedId,
  initialMessagesMap,
}: AdminConversationsViewProps) {
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId || (conversations[0]?.id ?? "")
  );
  const [filterContext, setFilterContext] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((c) => {
    if (filterContext !== "all" && c.contextType !== filterContext) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchContext = c.contextId?.toLowerCase().includes(q);
      const matchEmail = c.guestEmail?.toLowerCase().includes(q);
      return matchTitle || matchContext || matchEmail;
    }
    return true;
  });

  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const selectedMessages = selectedId ? initialMessagesMap[selectedId] || [] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="font-headline font-bold text-3xl text-espresso-deep">
          Studio Inbox & Inquiries
        </h1>
        <p className="text-xs sm:text-sm text-espresso-muted mt-1">
          Direct realtime communication with customers regarding keepsake orders, bespoke briefs, and craft details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Thread List Sidebar */}
        <div className="lg:col-span-4 rounded-3xl bg-surface-custard border border-border-warm p-4 space-y-3">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ref, topic, or email..."
            className="w-full px-3.5 py-2 rounded-2xl border border-border-warm bg-surface-cloud text-xs text-espresso-deep focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
            {["all", "order", "custom_request", "general"].map((ctx) => (
              <button
                key={ctx}
                type="button"
                onClick={() => setFilterContext(ctx)}
                className={`px-3 py-1 rounded-full capitalize whitespace-nowrap transition-colors border ${
                  filterContext === ctx
                    ? "bg-espresso-deep text-white border-espresso-deep"
                    : "bg-surface-cloud text-espresso-muted border-border-warm hover:text-espresso-deep"
                }`}
              >
                {ctx.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* List items */}
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-espresso-muted">
                No conversation threads match your filter.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === selectedId;
                const dateStr = new Date(c.updatedAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border block ${
                      isSelected
                        ? "bg-surface-cloud border-primary/40 shadow-xs ring-1 ring-primary/20"
                        : "bg-surface-custard border-border-warm/60 hover:bg-surface-cloud"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs text-espresso-deep line-clamp-1">
                        {c.title}
                      </span>
                      <span className="text-[10px] text-espresso-muted font-mono whitespace-nowrap">
                        {dateStr}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-custard border border-border-warm text-espresso-muted uppercase font-bold tracking-wider">
                        {c.contextType.replace("_", " ")}
                      </span>
                      {c.isClosed ? (
                        <span className="text-[10px] text-espresso-muted">Resolved</span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-secondary" title="Active Thread" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Chat Thread */}
        <div className="lg:col-span-8">
          {selectedConversation ? (
            <ChatThread
              key={selectedConversation.id}
              conversation={selectedConversation}
              initialMessages={selectedMessages}
              isAdmin={true}
            />
          ) : (
            <div className="h-[650px] rounded-3xl bg-surface-custard border border-border-warm flex flex-col items-center justify-center text-center p-8 text-espresso-muted">
              <span className="text-4xl mb-3">📬</span>
              <p className="font-bold text-sm text-espresso-deep">No Conversation Selected</p>
              <p className="text-xs mt-1">Select an inquiry from the inbox sidebar to review messages or reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

