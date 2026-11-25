"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export function SiteFooter() {
  const pathname = usePathname();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubmitted(true);
      setNewsletterEmail("");
    }
  }

  return (
    <footer className="w-full bg-surface-custard pt-16 pb-12 mt-auto border-t border-border-warm">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Join the Charm Club Newsletter Vitrine */}
        <div className="bg-[#FFF9F5] rounded-2xl p-8 lg:p-12 mb-16 shadow-sm border border-[#2C1E16]/15 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md text-center md:text-left">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.16em] text-[#A62C4B] mb-2">
              Secret Drop Access
            </span>
            <h3 className="font-headline text-2xl md:text-headline-sm text-[#2C1E16] mb-2 font-bold">
              Join the Charm Club
            </h3>
            <p className="font-body-md text-body-md text-[#2C1E16]/75">
              Receive monthly secret drops, bespoke clay recipe previews, and a sweet discount on your next handmade charm.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 shrink-0">
            {newsletterSubmitted ? (
              <div className="p-3.5 border border-[#2F5D3A]/30 text-[#2F5D3A] text-sm rounded-md font-semibold px-5 flex items-center gap-2">
                <Icon name="verified" className="text-[18px]" aria-hidden="true" />
                Thank you! You&apos;re subscribed to studio drops.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 w-full">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address..."
                  aria-label="Email address for newsletter"
                  className="bg-canvas-butter rounded-md px-4 py-3 font-body-sm text-body-sm text-[#2C1E16] placeholder:text-[#2C1E16]/50 outline-none min-w-[260px] border border-[#2C1E16]/20 focus:ring-2 focus:ring-[#A62C4B]/20 focus:border-[#A62C4B] transition-all"
                />
                <button
                  type="submit"
                  className="bg-[#A62C4B] hover:bg-[#2C1E16] text-[#FFF9F5] rounded-md px-6 py-3 font-label-lg text-label-lg font-bold transition-colors active:scale-95 text-center"
                >
                  Join Collector Club
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4-Column Boutique Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2C1E16]/10">
          {/* Brand Mission & Identity */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-md bg-[#2C1E16] flex items-center justify-center text-[#FFF9F5] group-hover:bg-[#A62C4B] transition-colors">
                <Icon name="pets" className="text-[19px]" aria-hidden="true" />
              </div>
              <span className="font-headline font-bold text-xl text-[#2C1E16] leading-none group-hover:text-[#A62C4B] transition-colors">
                Laira Charms
              </span>
            </Link>
            <p className="font-body-sm text-body-sm text-[#2C1E16]/75 leading-relaxed">
              Individually shaped, oven-baked, hand-painted, and triple UV diamond glazed clay keepsakes crafted with love in Pakistan.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs font-medium text-[#2C1E16]">
              <span className="inline-flex items-center gap-1">
                <Icon name="verified" className="text-[14px] text-[#A62C4B]" aria-hidden="true" /> Handcrafted 1-of-1
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="favorite" className="text-[14px] text-[#A62C4B]" aria-hidden="true" /> Resin Glazed
              </span>
            </div>
          </div>

          {/* Boutique Treasures */}
          <div>
            <h4 className="font-title-sm text-title-sm text-espresso-deep mb-4 font-bold">
              Boutique Treasures
            </h4>
            <ul className="space-y-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <Link href="/shop" className="hover:text-espresso-deep transition-colors">
                  Ready-Made Drops &amp; Critters
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-espresso-deep transition-colors">
                  Custom Atelier Commissions
                </Link>
              </li>
              <li>
                <Link href="/shop?category=personalized-charms" className="hover:text-espresso-deep transition-colors">
                  Pastel Nameplate Charms
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-espresso-deep transition-colors">
                  Workshop Story &amp; Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Atelier Care & Policy Links */}
          <div>
            <h4 className="font-title-sm text-title-sm text-espresso-deep mb-4 font-bold">
              Atelier Care
            </h4>
            <ul className="space-y-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <Link href="/shipping" className="hover:text-espresso-deep transition-colors">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-espresso-deep transition-colors">
                  Returns &amp; Replacement Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-espresso-deep transition-colors">
                  Charm Care &amp; FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-espresso-deep transition-colors">
                  Contact Studio Maker
                </Link>
              </li>
            </ul>
          </div>

          {/* Maker Promise Card */}
          <div>
            <h4 className="font-title-sm text-title-sm text-espresso-deep mb-4 font-bold">
              Maker Promise
            </h4>
            <div className="bg-surface-container-low rounded-2xl p-4 space-y-2 border border-border-warm/50">
              <div className="flex items-center gap-2 text-primary font-bold text-label-md font-label-md">
                <Icon name="shield" className="text-[18px]" aria-hidden="true" />
                100% Artisan Sealed
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Every charm receives triple UV-resin coating to protect its hand-painted details from drops, pocket rubs, and daily wear.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-bold text-espresso-muted">
                <span className="px-2 py-0.5 rounded-md bg-surface-cloud border border-border-warm/60">Meezan IBAN</span>
                <span className="px-2 py-0.5 rounded-md bg-surface-cloud border border-border-warm/60">EasyPaisa</span>
                <span className="px-2 py-0.5 rounded-md bg-surface-cloud border border-border-warm/60">JazzCash</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Administrative Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-label-sm font-label-sm text-espresso-muted">
          <p>
            &copy; {new Date().getFullYear()} Laira Charms Atelier. Handcrafted in Pakistan with warmth &amp; clay dust.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-espresso-deep transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-espresso-deep transition-colors">
              Terms of Service
            </Link>
            <Link href="/admin/orders" className="hover:text-espresso-deep transition-colors text-espresso-deep font-semibold">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
