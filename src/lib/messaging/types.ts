import type { MessageVisibility } from "@/lib/supabase/types";

export type { MessageVisibility };

export type ConversationContextType = "general" | "custom_request" | "order" | "quotation";

export type MessageSenderType = "customer" | "admin" | "system";

export interface MessageAttachment {
  id: string;
  messageId: string;
  storagePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string | null;
  senderType: MessageSenderType;
  senderName: string;
  body: string;
  visibility: MessageVisibility;
  isRead: boolean;
  attachments: MessageAttachment[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  contextType: ConversationContextType;
  contextId: string | null;
  customerId: string | null;
  guestEmail: string | null;
  guestTokenHash: string | null;
  isClosed: boolean;
  unreadCount?: number;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  base64Data?: string;
  storagePath?: string;
}

export interface SendMessageInput {
  conversationId: string;
  body: string;
  visibility?: MessageVisibility;
  attachments?: AttachmentInput[];
}

export interface CreateConversationInput {
  title: string;
  contextType: ConversationContextType;
  contextId?: string | null;
  guestEmail?: string | null;
  initialMessage: string;
  attachments?: AttachmentInput[];
}

