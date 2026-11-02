import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConversation, type ActorContext } from "@/lib/messaging/messaging-service";
import { ChatThread } from "@/components/messaging/ChatThread";
import Link from "next/link";

interface ConversationPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({
  params,
}: ConversationPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Inquiry Thread #${id} | Laira Charms`,
    description: "Realtime messaging thread with Laira Charms artisanal studio.",
  };
}

export default async function CustomerConversationPage({
  params,
  searchParams,
}: ConversationPageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  let actorContext: ActorContext = {
    role: "customer",
    guestToken: token || null,
  };

  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      actorContext = {
        ...actorContext,
        userId: user.id,
      };
    }
  } catch {
    // In dev / test fallback
  }

  let result;
  try {
    result = await getConversation(id, actorContext);
  } catch {
    notFound();
  }

  if (!result) {
    notFound();
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-surface-cloud/30">
      <div className="max-w-4xl mx-auto mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-espresso-muted hover:text-espresso-deep transition-colors"
        >
          &larr; Back to Storefront
        </Link>
      </div>

      <ChatThread
        conversation={result.conversation}
        initialMessages={result.messages}
        isAdmin={false}
        guestToken={token || null}
      />
    </div>
  );
}
