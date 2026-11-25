import { z } from "zod";

export const MAX_CHAT_MESSAGES = 12;
export const MAX_CHAT_MESSAGE_LENGTH = 1000;
export const MAX_CHAT_BODY_BYTES = 20_000;

export const chatRoleSchema = z.enum(["user", "assistant"]);

export const chatMessageSchema = z.object({
  role: chatRoleSchema,
  content: z
    .string()
    .trim()
    .min(1, "Please enter a message before sending.")
    .max(
      MAX_CHAT_MESSAGE_LENGTH,
      `Messages cannot exceed ${MAX_CHAT_MESSAGE_LENGTH} characters.`
    ),
});

export const chatRequestSchema = z
  .object({
    messages: z
      .array(chatMessageSchema)
      .min(1, "Conversation must contain at least one message.")
      .max(
        MAX_CHAT_MESSAGES,
        `Conversation history is limited to the last ${MAX_CHAT_MESSAGES} messages.`
      ),
  })
  .refine((data) => data.messages[data.messages.length - 1]?.role === "user", {
    message: "The latest message must be from the customer.",
    path: ["messages"],
  });

export type ChatRole = z.infer<typeof chatRoleSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
