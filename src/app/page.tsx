import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface-custard py-16 sm:py-24 border-b border-border-warm">
        {/* Floating Pastel Glow Accents */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute left-8 top-12 h-32 w-32 rounded-full bg-strawberry-subtle/70 blur-3xl" />
          <div className="absolute right-12 top-20 h-40 w-40 rounded-full bg-peach-cream/30 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-36 w-36 rounded-full bg-matcha-soft/20 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-cloud px-4 py-1.5 shadow-sm text-espresso-deep text-xs sm:text-sm font-semibold mb-6 border border-border-warm/40">
            <span>🌸</span> Polymer Clay, Resin &amp; Endless Affection
          </div>

          <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-extrabold text-espresso-deep max-w-4xl mx-auto leading-tight">
            Handcrafted keepsakes baked to brighten everyday rituals.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-espresso-muted max-w-2xl mx-auto leading-relaxed">
            From sweet strawberry treats to custom personalized nameplates, each charm is sculpted by hand in Pakistan with meticulous care and a triple UV diamond glaze.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/shop"
              className="px-8 py-3.5 rounded-full bg-primary text-white font-bold text-sm sm:text-base hover:bg-opacity-95 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Browse Ready-Made Charms
            </Link>
            <Link
              href="/custom-order"
              className="px-8 py-3.5 rounded-full bg-surface-cloud text-espresso-deep font-bold text-sm sm:text-base hover:bg-surface-container transition-all border border-border-warm shadow-sm active:scale-95"
            >
              Request Bespoke Charm
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-canvas-butter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-widest text-primary block mb-2">
              Our Artisanal Standard
            </span>
            <h2 className="font-headline text-3xl font-bold text-espresso-deep">
              Crafted by human hands, never machine molds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-surface-cloud border border-border-warm shadow-sm flex flex-col items-center text-center hover:translate-y-[-2px] transition-transform">
              <div className="w-16 h-16 rounded-2xl bg-strawberry-subtle flex items-center justify-center text-3xl mb-5 shadow-sm">
                🍓
              </div>
              <h3 className="font-headline text-xl font-bold text-espresso-deep mb-2">
                100% Handcrafted
              </h3>
              <p className="text-sm text-espresso-muted leading-relaxed">
                Sculpted, textured, oven-cured, and hand-painted piece by piece. No two charms are ever identical.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-surface-cloud border border-border-warm shadow-sm flex flex-col items-center text-center hover:translate-y-[-2px] transition-transform">
              <div className="w-16 h-16 rounded-2xl bg-peach-tint flex items-center justify-center text-3xl mb-5 shadow-sm">
                ✨
              </div>
              <h3 className="font-headline text-xl font-bold text-espresso-deep mb-2">
                UV Diamond Glaze
              </h3>
              <p className="text-sm text-espresso-muted leading-relaxed">
                Triple-coated with non-yellowing UV gloss resin for drop-resistant, scratch-resistant daily durability.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-surface-cloud border border-border-warm shadow-sm flex flex-col items-center text-center hover:translate-y-[-2px] transition-transform">
              <div className="w-16 h-16 rounded-2xl bg-matcha-tint flex items-center justify-center text-3xl mb-5 shadow-sm">
                🎨
              </div>
              <h3 className="font-headline text-xl font-bold text-espresso-deep mb-2">
                Personalized Atelier
              </h3>
              <p className="text-sm text-espresso-muted leading-relaxed">
                Add custom stamped initials, choose pastel color swatches, or commission one-of-a-kind miniature concepts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Order Explainer Banner */}
      <section className="py-16 bg-surface-custard border-t border-border-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface-cloud p-8 sm:p-12 rounded-3xl border border-border-warm shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl space-y-3 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Bespoke Atelier Commission
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold text-espresso-deep">
                Have a unique character or design in mind?
              </h2>
              <p className="text-sm text-espresso-muted leading-relaxed">
                Submit reference photos and ideas. Our atelier reviews each custom request, issues an itemized quotation with estimated lead time, and sculpts your keepsake once confirmed.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/custom-order"
                className="px-8 py-3.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-opacity-95 transition-all shadow-sm"
              >
                Inquire for Custom Quote →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
