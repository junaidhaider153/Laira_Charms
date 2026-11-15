import crypto from "crypto";
import { generateGuestToken, verifyGuestToken } from "@/lib/auth/guest-token";
import type {
  Conversation,
  Message,
  MessageAttachment,
  CreateConversationInput,
  SendMessageInput,
  MessageSenderType,
} from "./types";
import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_ATTACHMENTS_PER_MESSAGE,
} from "./schemas";
import { enqueueNotification } from "@/lib/notifications/outbox-service";

export const MEMORY_CONVERSATIONS: Map<string, Conversation> = new Map();
export const MEMORY_MESSAGES: Map<string, Message[]> = new Map();

// Seed initial conversations for testing and development
const sampleConv1Id = "conv-order-7788";
const sampleGuestEmail = "ayesha@example.com";
let sampleGuestHash = "sample-guest-hash-7788";
let sampleGuestToken = "sample-guest-token-7788";

if (process.env.NODE_ENV !== "production") {
  try {
    const generated = generateGuestToken(sampleConv1Id, sampleGuestEmail);
    sampleGuestHash = generated.hash;
    sampleGuestToken = generated.token;
  } catch {
    // Suppress if token secret is not set during production build
  }
}

export const SAMPLE_GUEST_CONV_ID = sampleConv1Id;
export const SAMPLE_GUEST_TOKEN = sampleGuestToken;

MEMORY_CONVERSATIONS.set(sampleConv1Id, {
  id: sampleConv1Id,
  title: "Inquiry on Order LC-20261031-7788",
  contextType: "order",
  contextId: "LC-20261031-7788",
  customerId: null,
  guestEmail: sampleGuestEmail,
  guestTokenHash: sampleGuestHash,
  isClosed: false,
  createdAt: new Date(Date.now() - 7200000).toISOString(),
  updatedAt: new Date(Date.now() - 1800000).toISOString(),
});

MEMORY_MESSAGES.set(sampleConv1Id, [
  {
    id: "msg-001",
    conversationId: sampleConv1Id,
    senderId: null,
    senderType: "customer",
    senderName: "Ayesha Noor",
    body: "Assalam-o-Alaikum! Can I confirm if my Cherry Blossom charm can include golden foil accents in the clay?",
    visibility: "customer_and_admin",
    isRead: true,
    attachments: [],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "msg-002",
    conversationId: sampleConv1Id,
    senderId: "admin-seed-01",
    senderType: "admin",
    senderName: "Studio Artisan (Internal)",
    body: "Clay batch #4 has Dutch gold leaf sheets in stock. We can embed the flakes prior to curing without any surcharge.",
    visibility: "internal_admin_only", // CRITICAL: Internal note must NEVER leak to customer
    isRead: true,
    attachments: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "msg-003",
    conversationId: sampleConv1Id,
    senderId: "admin-seed-01",
    senderType: "admin",
    senderName: "✨ Laira Charms Studio",
    body: "Walaikum Assalam Ayesha! Yes absolutely, our artisan will embed gentle gold leaf accents into the petals before oven-curing. It looks stunning under the diamond UV glaze!",
    visibility: "customer_and_admin",
    isRead: false,
    attachments: [],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
]);

export interface ActorContext {
  userId?: string | null;
  role?: "admin" | "customer";
  guestToken?: string | null;
}

/**
 * Validates whether the actor has access to a specific conversation thread.
 */
export function canAccessConversation(
  conversation: Conversation,
  actor: ActorContext
): boolean {
  // Admin has unconditional access
  if (actor.role === "admin") return true;

  // Registered customer check
  if (conversation.customerId) {
    return Boolean(actor.userId && actor.userId === conversation.customerId);
  }

  // Guest check via HMAC token
  if (conversation.guestEmail) {
    if (!actor.guestToken) return false;
    const validById = verifyGuestToken(conversation.id, conversation.guestEmail, actor.guestToken);
    const validByContext = conversation.contextId
      ? verifyGuestToken(conversation.contextId, conversation.guestEmail, actor.guestToken)
      : false;
    return validById || validByContext;
  }

  return false;
}

/**
 * Retrieves a conversation and its messages with strict Internal Note Isolation.
 */
export async function getConversation(
  conversationId: string,
  actor: ActorContext
): Promise<{ conversation: Conversation; messages: Message[] } | null> {
  const conversation = MEMORY_CONVERSATIONS.get(conversationId);
  if (!conversation) return null;

  if (!canAccessConversation(conversation, actor)) {
    throw new Error("Unauthorized access to this conversation thread.");
  }

  const allMessages = MEMORY_MESSAGES.get(conversationId) || [];

  // CRITICAL SECURITY INVARIANT:
  // Customers and guests MUST NEVER receive internal admin notes.
  const filteredMessages =
    actor.role === "admin"
      ? [...allMessages]
      : allMessages.filter((m) => m.visibility === "customer_and_admin");

  // Sort chronologically
  filteredMessages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return {
    conversation,
    messages: filteredMessages,
  };
}

/**
 * Lists conversations for the actor (admin inbox or customer dashboard).
 */
export async function listConversations(
  actor: ActorContext,
  filter?: {
    contextType?: string;
    isClosed?: boolean;
    query?: string;
  }
): Promise<Conversation[]> {
  if (actor.role !== "admin" && !actor.userId) {
    // Unauthenticated guest cannot browse an entire conversation list
    return [];
  }

  let list: Conversation[] = Array.from(MEMORY_CONVERSATIONS.values());

  if (actor.role !== "admin") {
    // Registered customer: only own threads
    list = list.filter((c) => c.customerId === actor.userId);
  }

  if (filter?.contextType && filter.contextType !== "all") {
    list = list.filter((c) => c.contextType === filter.contextType);
  }

  if (filter?.isClosed !== undefined) {
    list = list.filter((c) => c.isClosed === filter.isClosed);
  }

  if (filter?.query && filter.query.trim()) {
    const q = filter.query.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.contextId && c.contextId.toLowerCase().includes(q)) ||
        (c.guestEmail && c.guestEmail.toLowerCase().includes(q))
    );
  }

  // Populate last message and unread count
  const result: Conversation[] = list.map((c) => {
    const msgs = MEMORY_MESSAGES.get(c.id) || [];
    const visibleMsgs =
      actor.role === "admin"
        ? msgs
        : msgs.filter((m) => m.visibility === "customer_and_admin");

    const unread = visibleMsgs.filter((m) => !m.isRead).length;
    const last = visibleMsgs[visibleMsgs.length - 1];

    return {
      ...c,
      unreadCount: unread,
      lastMessage: last,
    };
  });

  result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return result;
}

/**
 * Creates a new conversation thread.
 */
export async function createConversation(
  input: CreateConversationInput,
  actor: ActorContext
): Promise<{ conversation: Conversation; guestToken?: string; initialMessage: Message }> {
  const conversationId = `conv-${crypto.randomUUID().slice(0, 8)}`;
  let guestToken: string | undefined;
  let guestTokenHash: string | null = null;
  let customerId: string | null = null;
  let guestEmail: string | null = null;

  if (actor.userId) {
    customerId = actor.userId;
  } else if (input.guestEmail) {
    guestEmail = input.guestEmail.toLowerCase().trim();
    const tokenObj = generateGuestToken(conversationId, guestEmail);
    guestToken = tokenObj.token;
    guestTokenHash = tokenObj.hash;
  } else {
    throw new Error("Either customer authentication or guest email is required.");
  }

  const now = new Date().toISOString();
  const conversation: Conversation = {
    id: conversationId,
    title: input.title.trim(),
    contextType: input.contextType,
    contextId: input.contextId || null,
    customerId,
    guestEmail,
    guestTokenHash,
    isClosed: false,
    createdAt: now,
    updatedAt: now,
  };

  // Process attachments
  const attachments: MessageAttachment[] = [];
  if (input.attachments && input.attachments.length > 0) {
    if (input.attachments.length > MAX_ATTACHMENTS_PER_MESSAGE) {
      throw new Error(`Maximum ${MAX_ATTACHMENTS_PER_MESSAGE} attachments permitted.`);
    }

    for (const att of input.attachments) {
      if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(att.mimeType as unknown as typeof ALLOWED_ATTACHMENT_MIME_TYPES[number])) {
        throw new Error(`Invalid file type: ${att.mimeType}`);
      }
      if (att.sizeBytes > MAX_ATTACHMENT_SIZE_BYTES) {
        throw new Error(`Attachment exceeds 10 MB limit.`);
      }
      attachments.push({
        id: `att-${crypto.randomUUID().slice(0, 8)}`,
        messageId: "", // will be linked below
        storagePath: att.storagePath || `message-attachments/${conversationId}/${att.fileName}`,
        fileName: att.fileName,
        mimeType: att.mimeType,
        sizeBytes: att.sizeBytes,
        url: att.base64Data || undefined,
        createdAt: now,
      });
    }
  }

  const senderType: MessageSenderType = actor.role === "admin" ? "admin" : "customer";
  const senderName =
    actor.role === "admin"
      ? "✨ Laira Charms Studio"
      : (guestEmail ? guestEmail.split("@")[0] : "Customer");

  const messageId = `msg-${crypto.randomUUID().slice(0, 8)}`;
  attachments.forEach((a) => (a.messageId = messageId));

  const initialMessage: Message = {
    id: messageId,
    conversationId,
    senderId: actor.userId || null,
    senderType,
    senderName,
    body: input.initialMessage.trim(),
    visibility: "customer_and_admin",
    isRead: false,
    attachments,
    createdAt: now,
  };

  MEMORY_CONVERSATIONS.set(conversationId, conversation);
  MEMORY_MESSAGES.set(conversationId, [initialMessage]);

  return { conversation, guestToken, initialMessage };
}

/**
 * Sends a new message in a conversation thread with internal note enforcement.
 */
export async function sendMessage(
  input: SendMessageInput,
  actor: ActorContext
): Promise<Message> {
  const conversation = MEMORY_CONVERSATIONS.get(input.conversationId);
  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  if (conversation.isClosed) {
    throw new Error("This conversation thread is closed. Please reopen or start a new inquiry.");
  }

  if (!canAccessConversation(conversation, actor)) {
    throw new Error("Unauthorized to participate in this conversation.");
  }

  // CRITICAL ENFORCEMENT:
  // Customers/guests CANNOT post internal notes.
  let visibility = input.visibility || "customer_and_admin";
  if (actor.role !== "admin") {
    visibility = "customer_and_admin";
  }

  const now = new Date().toISOString();
  const messageId = `msg-${crypto.randomUUID().slice(0, 8)}`;

  // Attachments processing
  const attachments: MessageAttachment[] = [];
  if (input.attachments && input.attachments.length > 0) {
    if (input.attachments.length > MAX_ATTACHMENTS_PER_MESSAGE) {
      throw new Error(`Maximum ${MAX_ATTACHMENTS_PER_MESSAGE} attachments permitted.`);
    }

    for (const att of input.attachments) {
      if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(att.mimeType as unknown as typeof ALLOWED_ATTACHMENT_MIME_TYPES[number])) {
        throw new Error(`Invalid file type: ${att.mimeType}`);
      }
      if (att.sizeBytes > MAX_ATTACHMENT_SIZE_BYTES) {
        throw new Error(`Attachment exceeds 10 MB limit.`);
      }
      attachments.push({
        id: `att-${crypto.randomUUID().slice(0, 8)}`,
        messageId,
        storagePath: att.storagePath || `message-attachments/${conversation.id}/${att.fileName}`,
        fileName: att.fileName,
        mimeType: att.mimeType,
        sizeBytes: att.sizeBytes,
        url: att.base64Data || undefined,
        createdAt: now,
      });
    }
  }

  const senderType: MessageSenderType = actor.role === "admin" ? "admin" : "customer";
  const senderName =
    actor.role === "admin"
      ? (visibility === "internal_admin_only" ? "Studio Artisan (Internal)" : "✨ Laira Charms Studio")
      : (conversation.guestEmail ? conversation.guestEmail.split("@")[0] : "Customer");

  const message: Message = {
    id: messageId,
    conversationId: conversation.id,
    senderId: actor.userId || null,
    senderType,
    senderName,
    body: input.body.trim(),
    visibility,
    isRead: false,
    attachments,
    createdAt: now,
  };

  const existingMsgs = MEMORY_MESSAGES.get(conversation.id) || [];
  existingMsgs.push(message);
  MEMORY_MESSAGES.set(conversation.id, existingMsgs);

  conversation.updatedAt = now;

  // Trigger transactional email notification when studio artisan replies to customer thread
  if (actor.role === "admin" && visibility === "customer_and_admin") {
    const recipientEmail = conversation.guestEmail;
    if (recipientEmail) {
      try {
        await enqueueNotification({
          recipientEmail,
          recipientName: recipientEmail.split("@")[0] || "Valued Customer",
          eventType: "new_message",
          idempotencyKey: `reply_notif_${messageId}`,
          data: {
            threadTitle: conversation.title,
            messageSnippet: input.body.slice(0, 160),
            threadUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://lairacharms.vercel.app"}/conversations/${conversation.id}`,
          },
        });
      } catch {
        // Notification failure should not block message sending
      }
    }
  }

  return message;
}

/**
 * Closes or reopens a conversation thread.
 */
export async function toggleConversationStatus(
  conversationId: string,
  isClosed: boolean,
  actor: ActorContext
): Promise<Conversation> {
  const conversation = MEMORY_CONVERSATIONS.get(conversationId);
  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  if (!canAccessConversation(conversation, actor)) {
    throw new Error("Unauthorized to alter conversation status.");
  }

  conversation.isClosed = isClosed;
  conversation.updatedAt = new Date().toISOString();

  return conversation;
}

/**
 * Marks messages in a conversation as read.
 */
export async function markConversationAsRead(
  conversationId: string,
  readerType: "admin" | "customer"
): Promise<void> {
  const messages = MEMORY_MESSAGES.get(conversationId);
  if (!messages) return;

  for (const m of messages) {
    if (readerType === "admin" && m.senderType === "customer") {
      m.isRead = true;
    } else if (readerType === "customer" && m.senderType === "admin") {
      m.isRead = true;
    }
  }
}

/**
 * Retrieves an existing conversation linked to an order, or creates one.
 */
export async function getOrCreateOrderConversation(
  orderReference: string,
  guestEmail?: string | null,
  customerId?: string | null,
  guestToken?: string | null
): Promise<{ conversation: Conversation; messages: Message[]; guestToken?: string }> {
  // Look for existing thread
  for (const conv of MEMORY_CONVERSATIONS.values()) {
    if (conv.contextType === "order" && (conv.contextId === orderReference || conv.id === orderReference)) {
      const actor: ActorContext = {
        userId: customerId || null,
        role: "customer",
        guestToken: guestToken || null,
      };

      try {
        const thread = await getConversation(conv.id, actor);
        if (thread) {
          return {
            conversation: thread.conversation,
            messages: thread.messages,
            guestToken: guestToken || undefined,
          };
        }
      } catch {
        // Fallback to creating or checking access
      }
    }
  }

  // Create new thread for this order
  const actor: ActorContext = {
    userId: customerId || null,
    role: "customer",
  };

  const created = await createConversation(
    {
      title: `Inquiry on Order ${orderReference}`,
      contextType: "order",
      contextId: orderReference,
      guestEmail: guestEmail || null,
      initialMessage: "Artisanal order registered. You may post craft instructions or questions here.",
    },
    actor
  );

  return {
    conversation: created.conversation,
    messages: [created.initialMessage],
    guestToken: created.guestToken,
  };
}
