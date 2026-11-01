import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import Link from "next/link";

export const metadata = {
  title: "Contact Studio • Laira Charms",
  description: "Get in touch with the Laira Charms artisan workshop in Pakistan.",
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Contact Us" }]} />

      <div className="bg-surface-cloud p-8 sm:p-12 rounded-3xl border border-border-warm/60 shadow-sm mt-4">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-espresso-deep mb-4">
          Get in Touch with our Atelier
        </h1>
        <p className="text-sm text-espresso-muted mb-8 leading-relaxed">
          Have a question about an existing order, want to inquire about custom corporate favors, or need help with a custom quote? We are here to help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
          <div className="p-6 rounded-3xl bg-surface-custard border border-border-warm/60 space-y-3 shadow-xs">
            <span className="text-2xl">💬</span>
            <h3 className="font-headline font-bold text-base text-espresso-deep">Website First Messaging</h3>
            <p className="text-xs text-espresso-muted leading-relaxed">
              For real-time updates and attachments on orders and custom design requests, log in or use your guest order token to communicate directly with our workshop team.
            </p>
            <Link
              href="/account"
              className="inline-block text-xs font-bold text-strawberry-blush-dark hover:underline pt-1"
            >
              Open My Messages →
            </Link>
          </div>

          <div className="p-6 rounded-3xl bg-surface-custard border border-border-warm/60 space-y-3 shadow-xs">
            <span className="text-2xl">✉️</span>
            <h3 className="font-headline font-bold text-base text-espresso-deep">Email &amp; Response Hours</h3>
            <p className="text-xs text-espresso-muted leading-relaxed">
              Email: <span className="font-semibold text-espresso-deep">support@lairacharms.pk</span>
            </p>
            <p className="text-xs text-espresso-muted leading-relaxed">
              Hours: Monday to Saturday, 10:00 AM – 7:00 PM PKT. We typically respond within 24 hours.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-peach-tint/60 border border-strawberry-blush/20 text-xs text-espresso-muted space-y-2 shadow-xs">
          <h4 className="font-headline font-bold text-sm text-espresso-deep">Looking for Bespoke Orders?</h4>
          <p>
            If you want to submit reference pictures, color swatches, or request an individual quotation, please use our dedicated Bespoke Custom Order form.
          </p>
          <div className="pt-2">
            <Link
              href="/custom-order"
              className="px-6 py-2.5 rounded-full bg-strawberry-blush text-on-primary font-bold inline-block hover:opacity-95 transition-all shadow-xs active:scale-95"
            >
              Request Custom Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

