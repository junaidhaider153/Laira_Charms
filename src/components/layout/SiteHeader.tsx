"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";

const ANNOUNCEMENTS = [
  "🧸 Every charm baked with gentle love & sealed with triple UV diamond glaze",
  "🌸 Free delivery across Pakistan on orders above Rs. 3,000",
  "🎨 Custom Atelier open: bespoke character charms sculpted to order",
  "📦 Dispatched via reliable couriers nationwide with careful gift packaging",
];

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount, openDrawer } = useCart();
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Rotate announcement ticker every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: "Shop Catalog", href: "/shop" },
    { label: "Custom Atelier", href: "/custom-order" },
    { label: "Story & Care", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Announcement Ticker */}
      <div className="bg-surface-custard border-b border-border-warm text-on-surface py-2 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[20px] text-center">
          <p
            key={announcementIndex}
            className="text-xs font-semibold tracking-wide text-espresso-deep transition-opacity duration-500 animate-fadeIn"
          >
            {ANNOUNCEMENTS[announcementIndex]}
          </p>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-canvas-butter/95 backdrop-blur-md border-b border-border-warm/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-strawberry-subtle flex items-center justify-center text-strawberry-blush text-xl font-bold shadow-sm group-hover:scale-105 transition-transform">
              ✨
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-lg sm:text-2xl text-espresso-deep leading-none group-hover:text-primary transition-colors">
                Laira Charms
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-espresso-muted tracking-wider uppercase mt-1">
                Artisanal Keepsakes
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-full transition-all ${
                    isActive
                      ? "text-primary bg-strawberry-subtle font-bold"
                      : "text-espresso-muted hover:text-espresso-deep hover:bg-surface-custard"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Utility Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search Input (Desktop) */}
            <form
              action="/search"
              method="GET"
              className="hidden md:flex items-center bg-peach-tint/80 hover:bg-peach-tint rounded-full px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all border border-border-warm/40"
            >
              <span className="text-xs mr-2 text-espresso-muted">🔍</span>
              <input
                type="text"
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find charms..."
                className="bg-transparent border-0 outline-none text-xs text-on-surface placeholder:text-espresso-muted/80 w-28 xl:w-36"
                aria-label="Search charms"
              />
            </form>

            {/* Currency Pill */}
            <div className="hidden sm:flex items-center gap-1 bg-surface-custard border border-border-warm/60 rounded-full px-2.5 py-1 text-xs font-bold text-espresso-deep">
              <span>PKR (Rs.)</span>
            </div>

            {/* Account Icon */}
            <Link
              href="/account"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-peach-tint text-espresso-deep flex items-center justify-center hover:bg-strawberry-subtle hover:text-primary transition-colors"
              aria-label="Account Profile"
            >
              <span className="text-sm">👤</span>
            </Link>

            {/* Shopping Bag Trigger */}
            <button
              onClick={openDrawer}
              className="flex items-center gap-2 bg-strawberry-blush text-white rounded-full px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold shadow-sm hover:opacity-95 transition-all active:scale-95"
            >
              <span className="text-sm" aria-hidden="true">🛍️</span>
              <span className="sr-only sm:not-sr-only">Bag</span>
              <span
                className="bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-0.5 shadow-sm"
                aria-hidden="true"
              >
                {itemCount}
              </span>
              <span className="sr-only"> - Open shopping bag, {itemCount} items</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-full bg-surface-custard border border-border-warm flex items-center justify-center text-espresso-deep hover:bg-surface-container transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer Navigation */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-espresso-deep/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex pr-12">
            <div className="w-screen max-w-xs bg-canvas-butter shadow-2xl flex flex-col border-r border-border-warm">
              {/* Header inside mobile drawer */}
              <div className="p-5 bg-surface-custard border-b border-border-warm flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">✨</span>
                  <span className="font-headline font-bold text-lg text-espresso-deep">
                    Laira Charms
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-surface-cloud text-espresso-muted hover:text-espresso-deep flex items-center justify-center"
                  aria-label="Close mobile menu"
                >
                  ✕
                </button>
              </div>

              {/* Mobile Search */}
              <div className="p-4 border-b border-border-warm/60">
                <form
                  action="/search"
                  method="GET"
                  onSubmit={() => setIsMobileMenuOpen(false)}
                  className="flex items-center bg-peach-tint rounded-full px-3.5 py-2 border border-border-warm/40"
                >
                  <span className="text-xs mr-2 text-espresso-muted">🔍</span>
                  <input
                    type="text"
                    name="q"
                    placeholder="Find charms..."
                    className="w-full bg-transparent border-0 outline-none text-xs text-on-surface placeholder:text-espresso-muted"
                  />
                </form>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-2xl text-sm font-semibold text-espresso-deep hover:bg-surface-custard transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-border-warm/60 mt-4 space-y-1">
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-2xl text-sm font-semibold text-espresso-deep hover:bg-surface-custard transition-colors"
                  >
                    👤 My Account &amp; Orders
                  </Link>
                  <Link
                    href="/shipping"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-xs text-espresso-muted hover:text-espresso-deep"
                  >
                    Shipping Policy
                  </Link>
                  <Link
                    href="/returns"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-xs text-espresso-muted hover:text-espresso-deep"
                  >
                    Returns &amp; Exchanges
                  </Link>
                </div>
              </div>

              {/* Footer contact details inside drawer */}
              <div className="p-5 bg-surface-custard border-t border-border-warm text-xs text-espresso-muted">
                <p className="font-semibold text-espresso-deep mb-1">Handcrafted in Pakistan</p>
                <p>Triple UV glaze • Custom atelier open</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

