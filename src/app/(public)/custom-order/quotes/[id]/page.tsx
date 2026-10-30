import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { getQuotationById, getCustomRequestById } from "@/lib/custom-order/custom-order-service";
import { QuoteDecisionCard } from "@/components/custom-order/QuoteDecisionCard";

interface QuotePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export const metadata = {
  title: "Review Bespoke Quotation • Laira Charms",
  description: "Review and accept your formal handmade charm commission quotation.",
};

export default async function QuoteReviewPage({
  params,
  searchParams,
}: QuotePageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  const quotation = await getQuotationById(id);
  if (!quotation) {
    notFound();
  }

  // Attempt resolving current user session
  let customerId: string | null = null;
  let isAdmin = false;
  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      customerId = user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isAdmin = (profile as { role?: string } | null)?.role === "admin";
    }
  } catch {
    // Unauthenticated guest
  }

  const request = await getCustomRequestById(
    quotation.requestId,
    token,
    customerId,
    isAdmin
  );

  if (!request) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-error flex items-center justify-center text-2xl mx-auto">
          🔒
        </div>
        <h2 className="font-headline text-2xl font-bold text-espresso-deep">
          Quotation Access Protected
        </h2>
        <p className="text-sm text-espresso-muted leading-relaxed">
          This bespoke quotation is private to the commissioning customer. If you submitted as a guest, please use the secure link provided in your email confirmation.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <Breadcrumbs
        items={[
          { label: "Custom Atelier", href: "/custom-order" },
          { label: "Quotation Review" },
        ]}
      />

      <QuoteDecisionCard
        quotation={quotation}
        request={request}
        guestToken={token}
      />
    </div>
  );
}
