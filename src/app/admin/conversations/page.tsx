import { Metadata } from "next";
import { listConversations, getConversation } from "@/lib/messaging/messaging-service";
import { AdminConversationsView } from "@/components/messaging/AdminConversationsView";
import { guardAdmin } from "@/lib/auth/guards";
import type { Message } from "@/lib/messaging/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio Inbox | Admin Portal - Laira Charms",
  description: "Customer conversations, bespoke custom inquiries, and internal artisan notes.",
};

export default async function AdminConversationsPage() {
  const admin = await guardAdmin("/admin/conversations");
  const actor = { role: "admin" as const, userId: admin.id };
  const conversations = await listConversations(actor);

  const initialMessagesMap: Record<string, Message[]> = {};
  for (const c of conversations) {
    const thread = await getConversation(c.id, actor);
    if (thread) {
      initialMessagesMap[c.id] = thread.messages;
    }
  }

  return (
    <div className="py-2">
      <AdminConversationsView
        conversations={conversations}
        initialMessagesMap={initialMessagesMap}
      />
    </div>
  );
}

