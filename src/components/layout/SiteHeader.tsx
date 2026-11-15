"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Icon } from "@/components/ui/Icon";
import { isLiveSupabaseConfigured } from "@/lib/auth/offline-mode";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/lib/auth/auth-actions";

const ANNOUNCEMENTS = [
  "🧸 Every charm baked with gentle love & sealed with triple UV diamond glaze",
  "✨ Small batch handmade drops • Limited studio oven batches",
  "📦 Nationwide tracked delivery via PostEx & TCS • Handcrafted in Pakistan",
  "🎨 Custom Atelier open: bespoke character charms sculpted to order",
  "💌 Studio baking & dispatch turnaround: 7 to 14 business days",
];

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount, openDrawer } = useCart();
  const [announcements, setAnnouncements] = useState<string[]>(ANNOUNCEMENTS);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authState, setAuthState] = useState<{
    signedIn: boolean;
    isAdmin: boolean;
  }>({
    signedIn: false,
    isAdmin: false,
  });

  // Load custom announcement if configured in store_settings
  useEffect(() => {
    fetch("/api/settings/banner")
      .then((res) => (res.ok ? res.json() : null))
      .then((b) => {
        if (b && b.isEnabled && b.text) {
          setAnnouncements((prev) => [b.text, ...prev.filter((t) => t !== b.text)]);
        }
      })
      .catch(() => {});
  }, []);

  // Client-side auth state detection (skipped when Supabase is not live)
  useEffect(() => {
    if (!isLiveSupabaseConfigured()) {
      return;
    }

    let isMounted = true;
    const supabase = createClient();

    async function checkUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          if (isMounted) setAuthState({ signedIn: false, isAdmin: false });
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (isMounted) {
          setAuthState({
            signedIn: true,
            isAdmin: (profile as { role?: string } | null)?.role === "admin",
          });
        }
      } catch {
        if (isMounted) setAuthState({ signedIn: false, isAdmin: false });
      }
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Rotate announcement ticker every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

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

  // Public header is hidden completely on admin portal routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { label: "Shop Catalog", href: "/shop" },
    { label: "Custom Atelier", href: "/custom-order" },
    { label: "Story & Care", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* Dynamic Rotating Tagline Announcement Bar (Scrolls away with page) */}
      <div className="bg-surface-custard border-b border-border-warm text-on-surface py-2 px-4 overflow-hidden relative">
        <div className="max-w-[1240px] mx-auto flex items-center justify-center min-h-[22px]">
          <div className="relative w-full text-center flex items-center justify-center font-label-sm text-label-sm tracking-wide">
            <span
              key={announcementIndex}
              className="inline-flex items-center gap-2 text-espresso-deep transition-opacity duration-300 animate-fadeIn"
            >
              {announcements[announcementIndex]}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Sticky at top) */}
      <header className="sticky top-0 z-50 shadow-[0_2px_14px_rgba(60,42,33,0.05)]">
        <div className="bg-canvas-butter/95 backdrop-blur-md border-b border-border-warm/60">
          <div className="h-16 md:h-20 max-w-[1240px] mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
            {/* Brand Identity */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink group min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-strawberry-subtle flex items-center justify-center text-strawberry-blush-dark shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <Icon name="pets" className="text-[20px] sm:text-[22px]" aria-hidden="true" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline text-[17px] sm:text-[20px] md:text-headline-sm text-espresso-deep font-bold tracking-tight leading-none group-hover:text-primary transition-colors truncate">
                  Laira Charms
                </span>
                <span className="hidden sm:block font-label-sm text-[10px] md:text-label-sm text-espresso-muted tracking-wider uppercase mt-0.5 truncate">
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
                    className={`px-4 py-2 text-label-lg font-label-lg rounded-full transition-all ${
                      isActive
                        ? "text-primary bg-strawberry-subtle font-bold shadow-xs"
                        : "text-on-surface-variant hover:text-espresso-deep hover:bg-surface-custard/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Utility Icons */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Search Input */}
              <form
                action="/search"
                method="GET"
                className="hidden sm:flex items-center bg-peach-tint/80 hover:bg-peach-tint rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all border border-border-warm/40"
              >
                <Icon name="search" className="text-espresso-muted text-[18px] mr-1.5" aria-hidden="true" />
                <input
                  type="text"
                  name="q"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find charms..."
                  className="bg-transparent border-0 outline-none font-body-sm text-body-sm text-on-surface placeholder:text-espresso-muted/80 w-28 lg:w-36 p-0 focus:ring-0"
                  aria-label="Search charms"
                />
              </form>

              {/* Currency Pill */}
              <div className="hidden lg:flex items-center gap-1 bg-surface-custard rounded-full px-2.5 py-1.5 text-label-sm font-label-sm text-espresso-deep border border-border-warm/40 cursor-default">
                <span>PKR (Rs.)</span>
              </div>

              {/* Desktop Auth Entry Points */}
              <div className="hidden md:flex items-center gap-2">
                {authState.signedIn ? (
                  <>
                    {authState.isAdmin && (
                      <Link
                        href="/admin/orders"
                        className="px-2.5 py-1 text-label-sm font-label-sm font-bold bg-strawberry-subtle text-primary rounded-full hover:bg-strawberry-blush hover:text-white transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <form action={signOutAction} className="inline-flex">
                      <button
                        type="submit"
                        className="text-label-sm font-label-sm text-espresso-muted hover:text-primary px-2 py-1 rounded-full hover:bg-surface-custard transition-colors cursor-pointer"
                      >
                        Sign out
                      </button>
                    </form>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-label-sm font-label-sm text-espresso-deep hover:text-primary px-2.5 py-1 rounded-full hover:bg-surface-custard transition-colors font-medium"
                  >
                    Sign in
                  </Link>
                )}
              </div>

              {/* Account Profile Link (Always retained for test & navigation parity) */}
              <Link
                href="/account"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-peach-tint text-espresso-deep flex items-center justify-center hover:bg-strawberry-subtle hover:text-primary transition-colors cursor-pointer shrink-0"
                aria-label="Account Profile"
                title="Account Profile"
              >
                <Icon name="person" className="text-[18px]" aria-hidden="true" />
              </Link>

              {/* Shopping Bag Trigger Button */}
              <button
                onClick={openDrawer}
                className="flex items-center gap-1.5 sm:gap-2 bg-strawberry-blush text-on-primary rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 font-label-md text-label-md shadow-sm hover:opacity-95 transition-transform active:scale-95 shrink-0"
              >
                <Icon name="shopping_bag" className="text-[18px]" aria-hidden="true" />
                <span className="font-bold hidden sm:inline">Bag</span>
                <span
                  className="bg-surface-cloud text-primary font-bold rounded-full w-5 h-5 flex items-center justify-center text-label-sm font-label-sm shadow-sm"
                  aria-hidden="true"
                >
                  {itemCount}
                </span>
                <span className="sr-only"> - Open shopping bag, {itemCount} items</span>
              </button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-custard border border-border-warm flex items-center justify-center text-espresso-deep hover:bg-surface-container transition-colors shrink-0"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                <Icon name={isMobileMenuOpen ? "close" : "menu"} className="text-[20px]" aria-hidden="true" />
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
                    <div className="w-8 h-8 rounded-full bg-strawberry-subtle flex items-center justify-center text-strawberry-blush">
                      <Icon name="pets" className="text-[18px]" aria-hidden="true" />
                    </div>
                    <span className="font-headline font-bold text-lg text-espresso-deep">
                      Laira Charms
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-surface-cloud text-espresso-muted hover:text-espresso-deep flex items-center justify-center shadow-xs"
                    aria-label="Close mobile menu"
                  >
                    <Icon name="close" className="text-[18px]" aria-hidden="true" />
                  </button>
                </div>

                {/* Navigation Links inside Drawer */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-label-lg font-label-lg transition-all ${
                          isActive
                            ? "bg-strawberry-subtle text-primary font-bold shadow-xs"
                            : "text-espresso-deep hover:bg-surface-custard"
                        }`}
                      >
                        <span>{link.label}</span>
                        <Icon name="arrow_forward" className="text-[16px] text-espresso-muted" aria-hidden="true" />
                      </Link>
                    );
                  })}

                  <div className="pt-4 mt-4 border-t border-border-warm space-y-2">
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-label-lg text-espresso-deep hover:bg-surface-custard font-medium"
                    >
                      <Icon name="person" className="text-[20px] text-primary" aria-hidden="true" />
                      <span>My Account &amp; Orders</span>
                    </Link>

                    {/* Mobile Auth Entry Points */}
                    {authState.signedIn ? (
                      <div className="space-y-1.5 pt-1">
                        {authState.isAdmin && (
                          <Link
                            href="/admin/orders"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-3 rounded-2xl text-label-lg font-bold bg-strawberry-subtle text-primary"
                          >
                            <span>Admin Portal</span>
                            <Icon name="arrow_forward" className="text-[16px]" aria-hidden="true" />
                          </Link>
                        )}
                        <form action={signOutAction} className="w-full">
                          <button
                            type="submit"
                            className="w-full flex items-center justify-center px-4 py-2.5 rounded-2xl text-label-md font-medium text-espresso-muted hover:text-primary hover:bg-surface-custard transition-colors cursor-pointer"
                          >
                            Sign out
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Link
                          href="/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-center py-2.5 px-3 rounded-2xl bg-surface-custard border border-border-warm text-espresso-deep text-label-md font-bold hover:bg-surface-container transition-colors text-center"
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-center py-2.5 px-3 rounded-2xl bg-strawberry-blush text-white text-label-md font-bold hover:opacity-90 transition-opacity text-center shadow-xs"
                        >
                          Create account
                        </Link>
                      </div>
                    )}

                    <div className="p-4 mt-4 rounded-2xl bg-surface-custard border border-border-warm text-center space-y-1">
                      <span className="font-label-sm text-label-sm text-espresso-muted uppercase tracking-wider block">
                        Pakistani D2C Atelier
                      </span>
                      <span className="font-title-sm text-title-sm text-espresso-deep font-bold block">
                        Free Shipping Above Rs. 3,000
                      </span>
                      <span className="text-body-sm text-on-surface-variant block">
                        Delivery via PostEx &amp; TCS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Search bar inside drawer */}
                <div className="p-4 bg-surface-custard/50 border-t border-border-warm">
                  <form action="/search" method="GET" className="relative">
                    <input
                      type="text"
                      name="q"
                      placeholder="Search charms..."
                      className="w-full bg-surface-cloud border border-border-warm rounded-full px-4 py-2.5 text-body-sm text-espresso-deep placeholder:text-espresso-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-muted"
                    >
                      <Icon name="search" className="text-[18px]" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
