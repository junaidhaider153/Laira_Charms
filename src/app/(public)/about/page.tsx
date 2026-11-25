import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import Link from "next/link";

export const metadata = {
  title: "Our Story & Atelier Craft • Laira Charms",
  description: "Learn how Laira Charms handcrafts polymer clay and resin keepsakes in Pakistan.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Our Story & Craft" }]} />

      <div className="bg-[#FFF9F5] p-8 sm:p-12 rounded-2xl border border-[#2C1E16]/15 shadow-sm mt-4">
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-[#A62C4B] mb-3">
          Baked with Love in Pakistan
        </span>

        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[#2C1E16] mb-4">
          Every charm tells a sweet story.
        </h1>
        <p className="text-sm text-espresso-muted mb-8 leading-relaxed">
          Laira Charms began at a small kitchen worktable with pastel blocks of polymer clay, a tiny oven, and a passion for turning everyday bag accessories into handcrafted art.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="p-6 rounded-3xl bg-surface-custard border border-border-warm/60 text-center shadow-xs">
            <span className="text-3xl block mb-2">🤲</span>
            <h3 className="font-headline font-bold text-sm text-espresso-deep mb-1">Hand-Sculpted</h3>
            <p className="text-xs text-espresso-muted">Every miniature leaf, eye, and petal is rolled and shaped with fine clay tools.</p>
          </div>

          <div className="p-6 rounded-3xl bg-surface-custard border border-border-warm/60 text-center shadow-xs">
            <span className="text-3xl block mb-2">✨</span>
            <h3 className="font-headline font-bold text-sm text-espresso-deep mb-1">UV Diamond Glaze</h3>
            <p className="text-xs text-espresso-muted">Triple-coated and UV cured for a glassy, scratch-resistant, durable finish.</p>
          </div>

          <div className="p-6 rounded-3xl bg-surface-custard border border-border-warm/60 text-center shadow-xs">
            <span className="text-3xl block mb-2">💎</span>
            <h3 className="font-headline font-bold text-sm text-espresso-deep mb-1">Tarnish-Resistant</h3>
            <p className="text-xs text-espresso-muted">Fitted with sturdy gold and silver-tone lobster clasps and reinforced jump rings.</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-espresso-deep leading-relaxed pt-6 border-t border-border-warm/60">
          <h2 className="font-headline text-xl font-bold text-espresso-deep">
            Charm Care Instructions
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-espresso-muted">
            <li><strong className="text-espresso-deep">Water Resistance:</strong> While our UV glaze provides excellent splash resistance, avoid submerging charms in water, pools, or washing machines.</li>
            <li><strong className="text-espresso-deep">Cleaning:</strong> Gently wipe with a soft, dry microfiber cloth. Do not use alcohol, acetone, or harsh chemical cleaners.</li>
            <li><strong className="text-espresso-deep">Storage:</strong> Keep away from extreme continuous heat (e.g., parked car dashboards under direct summer sun).</li>
          </ul>
        </div>

        <div className="mt-10 pt-6 border-t border-border-warm/60 flex flex-wrap gap-4">
          <Link
            href="/shop"
            className="px-6 py-2.5 rounded-full bg-strawberry-blush text-on-primary font-bold text-xs hover:opacity-95 transition-all shadow-xs active:scale-95"
          >
            Shop the Collection
          </Link>
          <Link
            href="/custom-order"
            className="px-6 py-2.5 rounded-full bg-surface-custard border border-border-warm text-espresso-deep font-bold text-xs hover:bg-surface-container transition-all active:scale-95"
          >
            Commission a Bespoke Charm
          </Link>
        </div>
      </div>
    </div>
  );
}

