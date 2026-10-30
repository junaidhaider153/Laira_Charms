import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import Link from "next/link";

export const metadata = {
  title: "Returns & Exchanges • Laira Charms",
  description: "Replacement and damage protection policy for handmade artisanal keepsakes.",
};

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Returns & Exchanges" }]} />

      <div className="bg-canvas-butter p-8 sm:p-12 rounded-3xl border border-border-warm shadow-sm mt-4">
        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-espresso-deep mb-4">
          Returns &amp; Replacement Policy
        </h1>
        <p className="text-sm text-espresso-muted mb-8">
          Crafted with love, protected with care • Our commitment to handmade quality.
        </p>

        <div className="space-y-8 text-sm text-espresso-deep leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-headline text-xl font-bold text-espresso-deep flex items-center gap-2">
              <span>🛡️</span> Damaged in Transit Guarantee
            </h2>
            <p className="text-espresso-muted">
              We triple-check and safely bubble-wrap each piece. However, in the rare event that a charm arrives damaged during courier handling:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-espresso-muted">
              <li>Contact us within 48 hours of parcel delivery via website messaging or contact form.</li>
              <li>Provide clear unboxing photos/video showing the damaged item and courier packaging.</li>
              <li>We will craft and dispatch a free replacement or issue a full refund upon verification.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-xl font-bold text-espresso-deep flex items-center gap-2">
              <span>🎨</span> Personalized &amp; Custom Orders
            </h2>
            <p className="text-espresso-muted">
              Because custom nameplates and bespoke commissioned charms are individually sculpted with your unique specifications, they cannot be returned or cancelled once production has commenced. If we made an error in your spelling or chosen color palette, we will remake it free of charge.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-xl font-bold text-espresso-deep flex items-center gap-2">
              <span>💖</span> Artisanal Nature
            </h2>
            <p className="text-espresso-muted">
              Please note that slight organic variations in shade, texture, and size are the hallmark of genuine handmade polymer clay art. Each piece is unique.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-border-warm flex gap-4">
          <Link
            href="/contact"
            className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-xs hover:bg-opacity-95 transition-all shadow-sm"
          >
            Report an Issue / Message Atelier
          </Link>
          <Link
            href="/faq"
            className="px-6 py-2.5 rounded-full bg-surface-custard text-espresso-deep font-semibold text-xs hover:bg-surface-container transition-all"
          >
            Care Instructions FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
