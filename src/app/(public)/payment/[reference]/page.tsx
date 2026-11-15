import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPaymentByOrderReference } from "@/lib/payment/payment-service";
import { PaymentStatusCard } from "@/components/payment/PaymentStatusCard";
import { getPaymentInstructionsSettings } from "@/lib/settings/settings-service";
import { formatPaymentAccountsFromSettings } from "@/lib/payment/bank-details";

interface PaymentPageProps {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({ params }: PaymentPageProps): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Payment & Verification - ${reference} | Laira Charms`,
    description: "Submit manual bank transfer proof and review verification status for your handcrafted commission.",
  };
}

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {
  const { reference } = await params;
  const { token } = await searchParams;

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
    // Guest or unauthenticated
  }

  const result = await getPaymentByOrderReference(reference, token, customerId, isAdmin);

  if (!result) {
    notFound();
  }

  const paymentSettings = await getPaymentInstructionsSettings();
  const accounts = formatPaymentAccountsFromSettings(paymentSettings);

  return (
    <div className="min-h-screen bg-canvas-butter py-6">
      <PaymentStatusCard
        order={result.order}
        initialPayment={result.payment}
        guestToken={token}
        accounts={accounts}
      />
    </div>
  );
}

