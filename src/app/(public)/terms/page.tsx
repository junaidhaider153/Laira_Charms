import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata = {
  title: "Terms of Service • Laira Charms",
  description: "Terms and conditions for orders, manual payments, and custom commissions.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Terms of Service" }]} />

      <div className="bg-surface-cloud p-8 sm:p-12 rounded-3xl border border-border-warm/60 shadow-sm mt-4">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-espresso-deep mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-espresso-muted mb-8">
          Effective date: October 2026 • Governing single-merchant commerce and custom atelier works.
        </p>

        <div className="space-y-6 text-sm text-espresso-muted leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-headline text-lg font-bold text-espresso-deep">1. Store Identity &amp; Orders</h2>
            <p>
              Laira Charms operates as a single-brand artisan studio producing handcrafted keepsakes and clay accessories in Pakistan. Placing an order constitutes an offer to purchase under these terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-lg font-bold text-espresso-deep">2. Manual Payment Verification</h2>
            <p>
              Orders require manual transfer to our verified bank or wallet accounts. Submitting a screenshot shifts order status to Verification Pending. An order is confirmed only after our administration independently reconciles the payment against our bank records. Uploading fabricated receipts will result in immediate cancellation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-lg font-bold text-espresso-deep">3. Bespoke Quotes &amp; Expiry</h2>
            <p>
              Bespoke quotations issued by our atelier include an explicit validity period and production lead time. Expired quotations cannot be accepted. Once accepted and paid, bespoke terms and specifications are immutable.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-lg font-bold text-espresso-deep">4. Intellectual Property</h2>
            <p>
              All charm designs, photographic media, branding, and written content on this website are original intellectual property of Laira Charms. Unauthorized commercial reproduction is prohibited.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

