import { z } from "zod";
import type { ConversationContextType, MessageVisibility } from "./types";

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_ATTACHMENTS_PER_MESSAGE = 5;

export const attachmentInputSchema = z.object({
  fileName: z.string().min(1, "File name is required").max(255),
  mimeType: z.enum(ALLOWED_ATTACHMENT_MIME_TYPES, {
    errorMap: () => ({
      message: "Unsupported file format. Please upload JPG, PNG, WEBP, or PDF.",
    }),
  }),
  sizeBytes: z
    .number()
    .min(1, "File cannot be empty")
    .max(MAX_ATTACHMENT_SIZE_BYTES, "Attachment size exceeds the 10 MB limit"),
  base64Data: z.string().optional(),
  storagePath: z.string().optional(),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, "Conversation identifier is required"),
  body: z
    .string()
    .trim()
    .min(1, "Message content cannot be blank")
    .max(2000, "Message is too long (maximum 2,000 characters)"),
  visibility: z
    .enum(["customer_and_admin", "internal_admin_only"] as [
      MessageVisibility,
      ...MessageVisibility[]
    ])
    .default("customer_and_admin"),
  attachments: z
    .array(attachmentInputSchema)
    .max(MAX_ATTACHMENTS_PER_MESSAGE, "Maximum 5 attachments permitted per message")
    .optional()
    .default([]),
});

export const createConversationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Subject title must be at least 2 characters")
    .max(120, "Subject title cannot exceed 120 characters"),
  contextType: z.enum([
    "general",
    "custom_request",
    "order",
    "quotation",
  ] as [ConversationContextType, ...ConversationContextType[]]),
  contextId: z.string().nullable().optional(),
  guestEmail: z.string().email("Please provide a valid email address").nullable().optional(),
  initialMessage: z
    .string()
    .trim()
    .min(1, "Please provide an initial inquiry message")
    .max(2000, "Inquiry message is too long (maximum 2,000 characters)"),
  attachments: z
    .array(attachmentInputSchema)
    .max(MAX_ATTACHMENTS_PER_MESSAGE, "Maximum 5 attachments permitted per message")
    .optional()
    .default([]),
});

