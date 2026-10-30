import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import Link from "next/link";

export const metadata = {
  title: "Shipping & Delivery Policy • Laira Charms",
  description: "Nationwide delivery rates, dispatch timelines, and packaging details across Pakistan.",
};

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Shipping Policy" }]} />

      <div className="bg-canvas-butter p-8 sm:p-12 rounded-3xl border border-border-warm shadow-sm mt-4">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-espresso-deep mb-4">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="text-sm text-espresso-muted mb-8">
          Last updated: October 2026 • Orders delivered across Pakistan via verified couriers.
        </p>

        <div className="space-y-8 text-sm text-espresso-deep leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-headline text-xl font-bold text-espresso-deep flex items-center gap-2">
              <span>📦</span> Nationwide Shipping Rates
            </h2>
            <p className="text-espresso-muted">
              We deliver to all major cities and regions across Pakistan, including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Peshawar, Multan, and Quetta.
            </p>
            <div className="p-4 bg-surface-custard rounded-2xl border border-border-warm/60 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Standard Delivery (Nationwide)</span>
                <span className="text-primary font-bold">Rs. 250</span>
              </div>
              <div className="flex justify-between font-semibold text-secondary">
                <span>Orders over Rs. 3,000</span>
                <span className="font-bold">FREE SHIPPING</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-xl font-bold text-espresso-deep flex items-center gap-2">
              <span>⏳</span> Production &amp; Delivery Lead Times
            </h2>
            <p className="text-espresso-muted">
              Because each charm is sculpted, textured, oven-cured, and glazed by hand, processing times depend on the item type:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-espresso-muted">
              <li>
                <strong className="text-espresso-deep">Ready-Made Charms:</strong> Dispatched within 24–48 hours of payment verification.
              </li>
              <li>
                <strong className="text-espresso-deep">Personalized Configured Charms:</strong> Handcrafted and cured in 3–5 business days.
              </li>
              <li>
                <strong className="text-espresso-deep">Bespoke Made-to-Order Charms:</strong> Production lead time confirmed upon custom quotation acceptance (typically 7–10 days).
              </li>
            </ul>
            <p className="text-xs text-espresso-muted">
              Once dispatched, courier transit typically takes 2 to 4 business days depending on your destination city.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-xl font-bold text-espresso-deep flex items-center gap-2">
              <span>🎁</span> Gift-Ready Protective Packaging
            </h2>
            <p className="text-espresso-muted">
              All charms are packed in protective cushioned boxes with aesthetic backing cards and branded keepsake pouches, ensuring they arrive in pristine condition ready for gifting.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-border-warm flex flex-wrap gap-4">
          <Link
            href="/shop"
            className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs hover:bg-opacity-95 transition-all shadow-sm"
          >
            Explore Ready Charms
          </Link>
          <Link
            href="/contact"
            className="px-6 py-2.5 rounded-full bg-surface-custard text-espresso-deep font-semibold text-xs hover:bg-surface-container transition-all"
          >
            Have a Shipping Question?
          </Link>
        </div>
      </div>
    </div>
  );
}
