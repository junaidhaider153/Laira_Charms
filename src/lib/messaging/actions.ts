"use server";

import {
  createConversationSchema,
  sendMessageSchema,
} from "./schemas";
import {
  createConversation,
  sendMessage,
  toggleConversationStatus,
  markConversationAsRead,
  type ActorContext,
} from "./messaging-service";
import type { MessageVisibility } from "./types";

async function resolveActor(guestToken?: string | null, requestedAdmin?: boolean): Promise<ActorContext> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLiveSupabase = Boolean(
    supabaseUrl && !supabaseUrl.includes("dummy-project") && !supabaseUrl.includes("example.com")
  );

  if (isLiveSupabase) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        return {
          userId: user.id,
          role: (profile as { role?: "admin" | "customer" } | null)?.role === "admin" ? "admin" : "customer",
          guestToken: guestToken || null,
        };
      }
    } catch {
      // Fallback
    }
  }

  // Offline dev/test fallback
  if (requestedAdmin) {
    return {
      userId: "admin-dev-fallback",
      role: "admin",
      guestToken: null,
    };
  }

  // If a guestToken was passed in dev/guest mode
  return {
    userId: null,
    role: "customer",
    guestToken: guestToken || null,
  };
}

export async function createConversationAction(input: {
  title: string;
  contextType: "general" | "custom_request" | "order" | "quotation";
  contextId?: string | null;
  guestEmail?: string | null;
  initialMessage: string;
  attachments?: Array<{
    fileName: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
    sizeBytes: number;
    base64Data?: string;
  }>;
}) {
  const parsed = createConversationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid conversation input.",
    };
  }

  try {
    const actor = await resolveActor();
    const result = await createConversation(parsed.data, actor);

    return {
      success: true,
      message: "Conversation created successfully.",
      conversation: result.conversation,
      guestToken: result.guestToken,
      initialMessage: result.initialMessage,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create conversation.";
    return {
      success: false,
      message,
    };
  }
}

export async function sendMessageAction(input: {
  conversationId: string;
  body: string;
  visibility?: MessageVisibility;
  guestToken?: string | null;
  isAdminAction?: boolean;
  attachments?: Array<{
    fileName: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf";
    sizeBytes: number;
    base64Data?: string;
  }>;
}) {
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid message format.",
    };
  }

  try {
    const actor = await resolveActor(
      input.guestToken,
      input.isAdminAction || input.visibility === "internal_admin_only"
    );
    const message = await sendMessage(parsed.data, actor);

    return {
      success: true,
      message: "Message sent.",
      messageRecord: message,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send message.";
    return {
      success: false,
      message,
    };
  }
}

export async function toggleConversationStatusAction(input: {
  conversationId: string;
  isClosed: boolean;
  guestToken?: string | null;
  isAdminAction?: boolean;
}) {
  try {
    const actor = await resolveActor(input.guestToken, input.isAdminAction);
    const conversation = await toggleConversationStatus(
      input.conversationId,
      input.isClosed,
      actor
    );

    return {
      success: true,
      message: input.isClosed ? "Conversation closed." : "Conversation reopened.",
      conversation,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update conversation.";
    return {
      success: false,
      message,
    };
  }
}

export async function markMessagesReadAction(input: {
  conversationId: string;
  readerType: "admin" | "customer";
}) {
  try {
    await markConversationAsRead(input.conversationId, input.readerType);
    return { success: true };
  } catch {
    return { success: false };
  }
}
