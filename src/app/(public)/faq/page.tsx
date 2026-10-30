import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import Link from "next/link";

export const metadata = {
  title: "Frequently Asked Questions • Laira Charms",
  description: "Common questions about clay keychains, payments, shipping, and custom orders.",
};

export default function FaqPage() {
  const faqs = [
    {
      q: "How durable are polymer clay keychains?",
      a: "Our charms are baked to the exact curing temperature and triple-coated with high-grade UV diamond glaze. This makes them drop-resistant and resilient for daily use on keyrings, bags, and phone straps. However, like any fine miniature artwork, avoid deliberate heavy crushing or picking at tiny sculpted details.",
    },
    {
      q: "How does payment work?",
      a: "We accept manual bank and digital wallet transfers (Meezan Bank, EasyPaisa, and JazzCash). Upon placing your order, our account details will be presented. Simply transfer the exact order amount and upload a clear screenshot of your receipt. Our team independently verifies the receipt before marking your order confirmed.",
    },
    {
      q: "How long does shipping take across Pakistan?",
      a: "Ready-made orders are dispatched within 1–2 business days. Delivery across major cities (Karachi, Lahore, Islamabad) typically takes 2–3 business days. Remote or regional deliveries may take 3–5 business days.",
    },
    {
      q: "Can I order a custom name or design?",
      a: "Yes! We offer both configurable personalized items (where you choose preset options and names directly) and bespoke custom commissions where you submit an idea, receive an official quote, and review terms before payment.",
    },
    {
      q: "What is your refund policy?",
      a: "If your parcel arrives damaged during shipping, contact us within 48 hours with unboxing photos and we will craft a free replacement or refund the full amount. Personalized custom items cannot be cancelled once production begins.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Frequently Asked Questions" }]} />

      <div className="bg-canvas-butter p-8 sm:p-12 rounded-3xl border border-border-warm shadow-sm mt-4">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-espresso-deep mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-espresso-muted mb-8">
          Answers to your questions about our handcrafted charms, manual payments, and shipping.
        </p>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-surface-custard border border-border-warm/60 space-y-2"
            >
              <h3 className="font-headline font-bold text-base text-espresso-deep flex items-start gap-2">
                <span className="text-primary font-bold">Q.</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-espresso-muted leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border-warm flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h4 className="font-headline font-bold text-sm text-espresso-deep">Still have a question?</h4>
            <p className="text-xs text-espresso-muted">Reach out to our studio team directly.</p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs hover:bg-opacity-95 transition-all shadow-sm"
          >
            Contact Atelier
          </Link>
        </div>
      </div>
    </div>
  );
}
