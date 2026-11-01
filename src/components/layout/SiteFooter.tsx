"use client";

import React, { useState } from "react";
import Link from "next/link";

export function SiteFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubmitted(true);
      setNewsletterEmail("");
    }
  }

  return (
    <footer className="bg-surface-custard border-t border-border-warm mt-auto">
      {/* Upper 4-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Mission & Identity */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-full bg-strawberry-subtle flex items-center justify-center text-strawberry-blush text-xl font-bold shadow-sm group-hover:scale-105 transition-transform">
                ✨
              </div>
              <div>
                <span className="font-headline font-bold text-xl text-espresso-deep leading-tight block">
                  Laira Charms
                </span>
                <span className="text-[10px] font-semibold text-espresso-muted tracking-wider uppercase block">
                  Artisanal Keepsakes
                </span>
              </div>
            </Link>
            <p className="text-xs text-espresso-muted leading-relaxed">
              Every charm is lovingly hand-sculpted in Pakistan from premium polymer clay, oven-cured, and sealed with a triple UV diamond glaze for drop-resistant durability.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-espresso-deep pt-1">
              <span>🇵🇰</span> Handcrafted with pride in Pakistan
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3">
            <h4 className="font-headline font-bold text-sm text-espresso-deep uppercase tracking-wider">
              Atelier &amp; Collections
            </h4>
            <ul className="space-y-2 text-xs text-espresso-muted">
              <li>
                <Link href="/shop" className="hover:text-primary transition-colors">
                  Ready-Made Charms
                </Link>
              </li>
              <li>
                <Link href="/shop?category=personalized-charms" className="hover:text-primary transition-colors">
                  Personalized Nameplates
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-primary transition-colors">
                  Request Bespoke Design
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Workshop Story &amp; Craft
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Our Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="space-y-3">
            <h4 className="font-headline font-bold text-sm text-espresso-deep uppercase tracking-wider">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-espresso-muted">
              <li>
                <Link href="/shipping" className="hover:text-primary transition-colors">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-primary transition-colors">
                  Returns &amp; Replacement Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  Charm Care &amp; FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Payment Safety */}
          <div className="space-y-4">
            <h4 className="font-headline font-bold text-sm text-espresso-deep uppercase tracking-wider">
              Studio Updates
            </h4>
            <p className="text-xs text-espresso-muted leading-relaxed">
              Subscribe for new batch drops, limited seasonal charms, and atelier previews.
            </p>

            {newsletterSubmitted ? (
              <div className="p-3 bg-matcha-tint border border-secondary/20 text-secondary text-xs rounded-2xl font-medium">
                ✓ Thank you! You&apos;re subscribed to studio drops.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 rounded-full bg-surface-cloud border border-border-warm text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                  aria-label="Email address for newsletter"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-full bg-primary text-white font-bold text-xs hover:bg-opacity-95 transition-all shadow-sm"
                >
                  Join Collector Club
                </button>
              </form>
            )}

            {/* Payment Verification Badges */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-espresso-muted block mb-1.5">
                Verified Payment Options
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold text-espresso-deep">
                <span className="px-2 py-0.5 rounded-md bg-surface-cloud border border-border-warm/60">
                  Meezan Bank
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-cloud border border-border-warm/60">
                  Bank Transfer
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-cloud border border-border-warm/60">
                  EasyPaisa
                </span>
                <span className="px-2 py-0.5 rounded-md bg-surface-cloud border border-border-warm/60">
                  JazzCash
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Copyright Bar */}
      <div className="border-t border-border-warm/60 py-6 bg-canvas-butter/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-espresso-muted">
          <p>
            &copy; {new Date().getFullYear()} Laira Charms. All rights reserved. Sculpted &amp; baked in Pakistan.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privacy" className="hover:text-espresso-deep">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-espresso-deep">Terms</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-espresso-deep">Support</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-espresso-deep text-espresso-muted">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

