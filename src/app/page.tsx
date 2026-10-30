import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Announcement Bar */}
      <div className="bg-surface-custard border-b border-border-warm text-on-surface py-2 px-4 text-center">
        <p className="text-xs sm:text-sm font-medium tracking-wide text-espresso-deep flex items-center justify-center gap-2">
          <span>🧸</span> Every charm baked with gentle love &amp; sealed with triple UV diamond glaze in Pakistan
        </p>
      </div>

      {/* Main Header / Nav */}
      <header className="sticky top-0 z-40 bg-canvas-butter/95 backdrop-blur-md border-b border-border-warm/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-strawberry-subtle flex items-center justify-center text-strawberry-blush text-xl font-bold shadow-sm group-hover:scale-105 transition-transform">
              ✨
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-xl sm:text-2xl text-espresso-deep leading-none group-hover:text-primary transition-colors">
                Laira Charms
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-espresso-muted tracking-wider uppercase mt-1">
                Artisanal Keepsakes
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/shop"
              className="text-sm font-semibold text-espresso-muted hover:text-espresso-deep transition-colors"
            >
              Shop Catalog
            </Link>
            <Link
              href="/custom-order"
              className="text-sm font-semibold text-espresso-muted hover:text-espresso-deep transition-colors"
            >
              Custom Atelier
            </Link>
            <Link
              href="/about"
              className="text-sm font-semibold text-espresso-muted hover:text-espresso-deep transition-colors"
            >
              Story &amp; Care
            </Link>
            <Link
              href="/contact"
              className="text-sm font-semibold text-espresso-muted hover:text-espresso-deep transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="w-10 h-10 rounded-full bg-peach-tint text-espresso-deep flex items-center justify-center hover:bg-strawberry-subtle hover:text-primary transition-colors"
              aria-label="Account Profile"
            >
              👤
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 bg-strawberry-blush text-white rounded-full px-4 py-2 text-sm font-bold shadow-sm hover:opacity-95 transition-all"
            >
              <span>🛍️</span>
              <span className="hidden sm:inline">Bag</span>
              <span className="bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1">
                0
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-surface-custard py-16 sm:py-24 border-b border-border-warm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-cloud px-4 py-1.5 shadow-sm text-espresso-deep text-xs sm:text-sm font-semibold mb-6">
              <span>🌸</span> Made with Polymer Clay, Resin &amp; Endless Affection
            </div>
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-extrabold text-espresso-deep max-w-3xl mx-auto leading-tight">
              Handcrafted keepsakes baked to brighten everyday rituals.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-espresso-muted max-w-2xl mx-auto leading-relaxed">
              From sweet strawberry treats to custom personalized nameplates, each charm is sculpted by hand in Pakistan with meticulous care and durability.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link
                href="/shop"
                className="px-8 py-3.5 rounded-full bg-primary text-white font-bold text-sm sm:text-base hover:bg-opacity-95 transition-all shadow-md hover:shadow-lg"
              >
                Browse Ready-Made Charms
              </Link>
              <Link
                href="/custom-order"
                className="px-8 py-3.5 rounded-full bg-surface-cloud text-espresso-deep font-bold text-sm sm:text-base hover:bg-surface-container transition-all border border-border-warm shadow-sm"
              >
                Request Bespoke Charm
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-16 bg-canvas-butter">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-surface-cloud border border-border-warm shadow-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-strawberry-subtle flex items-center justify-center text-2xl mb-4">
                  🍓
                </div>
                <h3 className="font-headline text-xl font-bold text-espresso-deep mb-2">
                  100% Handcrafted
                </h3>
                <p className="text-sm text-espresso-muted leading-relaxed">
                  Sculpted, textured, oven-cured and hand-painted. No mass production or molds.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-surface-cloud border border-border-warm shadow-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-peach-tint flex items-center justify-center text-2xl mb-4">
                  ✨
                </div>
                <h3 className="font-headline text-xl font-bold text-espresso-deep mb-2">
                  UV Diamond Glaze
                </h3>
                <p className="text-sm text-espresso-muted leading-relaxed">
                  Triple-coated with non-yellowing UV gloss for drop-resistant everyday durability.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-surface-cloud border border-border-warm shadow-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-matcha-tint flex items-center justify-center text-2xl mb-4">
                  🎨
                </div>
                <h3 className="font-headline text-xl font-bold text-espresso-deep mb-2">
                  Personalized Atelier
                </h3>
                <p className="text-sm text-espresso-muted leading-relaxed">
                  Order custom names, colors, and bespoke character designs with direct atelier consultation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-custard border-t border-border-warm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-headline font-bold text-lg text-espresso-deep">Laira Charms</p>
            <p className="text-xs text-espresso-muted mt-1">
              &copy; {new Date().getFullYear()} Laira Charms. All rights reserved. Handcrafted in Pakistan.
            </p>
          </div>
          <div className="flex gap-6 text-xs text-espresso-muted">
            <Link href="/shipping" className="hover:text-espresso-deep">Shipping Policy</Link>
            <Link href="/returns" className="hover:text-espresso-deep">Returns &amp; Exchanges</Link>
            <Link href="/privacy" className="hover:text-espresso-deep">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-espresso-deep">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

