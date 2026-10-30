import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata = {
  title: "Privacy Policy • Laira Charms",
  description: "Customer data privacy, row-level security, and payment proof handling.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />

      <div className="bg-canvas-butter p-8 sm:p-12 rounded-3xl border border-border-warm shadow-sm mt-4">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-espresso-deep mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-espresso-muted mb-8">
          Effective date: October 2026 • Single-merchant boutique data protection.
        </p>

        <div className="space-y-6 text-sm text-espresso-muted leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-headline text-lg font-bold text-espresso-deep">1. Information We Collect</h2>
            <p>
              When you purchase or inquire on Laira Charms, we collect your name, email address, Pakistani phone number, and physical delivery address. If you upload a bank or wallet transfer screenshot, it is stored in private encrypted storage and is only accessible by authorized administrators for verification.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-lg font-bold text-espresso-deep">2. Data Isolation &amp; Security</h2>
            <p>
              We implement PostgreSQL Row Level Security (RLS). Customer accounts and guest access tokens are strictly isolated so that no other shopper can access or view your order history, uploaded proofs, or private messages.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-lg font-bold text-espresso-deep">3. Third Parties</h2>
            <p>
              We never sell, rent, or trade your personal information. Delivery addresses and contact phone numbers are shared solely with verified domestic courier partners for parcel dispatch and delivery contact.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-headline text-lg font-bold text-espresso-deep">4. Contacting Us Regarding Your Data</h2>
            <p>
              To request account deletion or data inspection, contact us at <span className="font-semibold text-espresso-deep">privacy@lairacharms.pk</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

