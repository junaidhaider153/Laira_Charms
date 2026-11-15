import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getOrderByReference } from "@/lib/checkout/order-service";
import { formatMoney } from "@/lib/utils";
import { CustomerOrderTimeline } from "@/components/order/CustomerOrderTimeline";
import { OrderReceipt } from "@/components/order/OrderReceipt";
import { getOrCreateOrderConversation } from "@/lib/messaging/messaging-service";
import { ChatThread } from "@/components/messaging/ChatThread";

interface OrderPageProps {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ token?: string }>;
}

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Order ${reference} | Laira Charms`,
    description: "Review your handcrafted keepsake order details and payment status.",
  };
}

export default async function OrderConfirmationPage({ params, searchParams }: OrderPageProps) {
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

  const order = await getOrderByReference(reference, token, customerId, isAdmin);

  if (!order) {
    notFound();
  }

  const address = order.shippingAddressSnapshot;
  const paymentProofUrl = token
    ? `/payment/${order.reference}?token=${encodeURIComponent(token)}`
    : `/payment/${order.reference}`;

  const { conversation, messages, guestToken } = await getOrCreateOrderConversation(
    order.reference,
    order.guestEmail,
    order.customerId,
    token
  );

  return (
    <div className="min-h-screen bg-canvas-butter py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Header */}
        <div className="p-8 rounded-3xl bg-surface-cloud border border-border-warm/60 text-center shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-peach-tint border border-strawberry-blush/20 flex items-center justify-center text-3xl shadow-xs">
            ✨
          </div>
          <span className="inline-block px-3.5 py-1 rounded-full bg-matcha-tint text-matcha-soft border border-matcha-soft/20 font-bold text-xs uppercase tracking-wider mb-2">
            Order Confirmed
          </span>
          <h1 className="font-headline font-bold text-3xl sm:text-4xl text-espresso-deep mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-espresso-muted text-sm sm:text-base max-w-lg mx-auto">
            We have received your keepsake order. Our artisan studio will begin crafting once payment proof is submitted and verified.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-canvas-butter border border-border-warm font-mono text-xs sm:text-sm text-espresso-deep">
            <span className="text-espresso-muted font-sans font-medium">Order Reference:</span>
            <span className="font-bold text-strawberry-blush-dark">{order.reference}</span>
          </div>
        </div>

        {/* Payment Required Action Card */}
        <div className="p-6 rounded-3xl bg-peach-tint/60 border border-strawberry-blush/20 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">💳</span>
            <div>
              <h2 className="font-headline font-bold text-lg text-espresso-deep">
                Next Step: Complete Payment &amp; Upload Proof
              </h2>
              <p className="text-xs text-espresso-muted mt-1 leading-relaxed">
                Your order is currently <span className="font-bold text-espresso-deep">Awaiting Payment</span>. Please transfer the total amount of <span className="font-bold text-strawberry-blush-dark">{formatMoney(order.totalMinor)}</span> via Meezan Bank, EasyPaisa, or JazzCash, then submit your transaction screenshot.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href={paymentProofUrl}
              className="py-3 px-6 rounded-full bg-strawberry-blush text-on-primary font-bold text-xs text-center hover:opacity-95 shadow-xs transition-all active:scale-95"
            >
              Upload Payment Proof Screenshot &rarr;
            </Link>
            <Link
              href="/shop"
              className="py-3 px-6 rounded-full bg-surface-cloud border border-border-warm text-espresso-deep font-bold text-xs text-center hover:bg-surface-container transition-all active:scale-95"
            >
              Browse More Charms
            </Link>
          </div>
        </div>

        {/* Artisanal Commission Progress Timeline */}
        <CustomerOrderTimeline
          orderStatus={order.orderStatus}
          paymentStatus={order.paymentStatus}
          notes={order.notes}
        />

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-surface-cloud border border-border-warm/60 shadow-sm space-y-4">
              <h3 className="font-headline font-bold text-lg text-espresso-deep border-b border-border-warm pb-3">
                Items in This Commission ({order.items.length})
              </h3>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 py-2 border-b border-border-warm/40 last:border-0">
                    <div className="relative w-16 h-16 rounded-xl bg-surface-cloud overflow-hidden shrink-0 border border-border-warm/50">
                      {item.customizationSnapshot?.imageUrl ? (
                        <Image
                          src={item.customizationSnapshot.imageUrl}
                          alt={item.productTitle}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-espresso-muted">
                          Charm
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-espresso-deep">
                        {item.productTitle}
                      </h4>
                      <p className="text-xs text-espresso-muted">
                        Qty: {item.quantity} &times; {formatMoney(item.unitPriceMinor)}
                      </p>

                      {item.customizationSnapshot?.customization && (
                        <div className="mt-1 text-[11px] text-espresso-deep">
                          {Object.entries(item.customizationSnapshot.customization).map(([k, v]) => (
                            <span key={k} className="inline-block mr-2 text-espresso-muted">
                              {k}: <strong className="text-espresso-deep">{v}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      {item.customizationSnapshot?.customText && (
                        <p className="text-[11px] text-primary font-mono font-bold mt-0.5">
                          Stamped: &quot;{item.customizationSnapshot.customText}&quot;
                        </p>
                      )}
                    </div>

                    <span className="font-bold text-sm text-espresso-deep shrink-0">
                      {formatMoney(item.totalMinor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping & Financial Breakdown */}
          <div className="md:col-span-5 space-y-6">
            {/* Delivery Address */}
            <div className="p-6 rounded-3xl bg-surface-cloud border border-border-warm/60 shadow-sm space-y-3">
              <h3 className="font-headline font-bold text-lg text-espresso-deep border-b border-border-warm pb-3">
                Delivery Address
              </h3>
              <div className="text-xs text-espresso-deep space-y-1">
                <p className="font-bold text-sm">{address.fullName}</p>
                <p className="text-espresso-muted">{address.phone}</p>
                <p className="text-espresso-muted">{address.email}</p>
                <p className="pt-1.5 leading-relaxed">
                  {address.streetAddress}, {address.city}, {address.province} {address.postalCode}
                </p>
                {address.orderNotes && (
                  <div className="mt-3 p-2.5 rounded-xl bg-surface-cloud border border-border-warm/50 text-[11px]">
                    <span className="font-semibold text-espresso-deep">Special Note: </span>
                    <span className="text-espresso-muted">{address.orderNotes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-6 rounded-3xl bg-surface-cloud border border-border-warm/60 shadow-sm space-y-3">
              <h3 className="font-headline font-bold text-lg text-espresso-deep border-b border-border-warm pb-3">
                Payment Summary
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-espresso-muted">
                  <span>Subtotal</span>
                  <span className="font-semibold text-espresso-deep">{formatMoney(order.subtotalMinor)}</span>
                </div>
                <div className="flex justify-between text-espresso-muted">
                  <span>Standard Delivery</span>
                  {order.shippingMinor === 0 ? (
                    <span className="font-bold text-secondary uppercase text-[11px]">FREE</span>
                  ) : (
                    <span className="font-semibold text-espresso-deep">{formatMoney(order.shippingMinor)}</span>
                  )}
                </div>
                <div className="border-t border-border-warm pt-3 flex justify-between items-baseline text-sm">
                  <span className="font-headline font-bold text-espresso-deep">Total Amount</span>
                  <div className="text-right">
                    <span className="font-headline font-bold text-xl text-espresso-deep">
                      {formatMoney(order.totalMinor)}
                    </span>
                    <span className="block text-[10px] text-espresso-muted">PKR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Official Sales Receipt & Tax Invoice */}
        <OrderReceipt order={order} />

        {/* Studio Realtime Communication Thread */}
        <section className="mt-8 space-y-3">
          <div>
            <h3 className="font-headline font-bold text-xl text-espresso-deep">
              Artisanal Studio Messages & Craft Inquiries
            </h3>
            <p className="text-xs text-espresso-muted">
              Directly message our studio artists regarding personalization, clay finishes, or dispatch updates.
            </p>
          </div>
          <ChatThread
            conversation={conversation}
            initialMessages={messages}
            isAdmin={isAdmin}
            guestToken={guestToken}
          />
        </section>
      </div>
    </div>
  );
}

