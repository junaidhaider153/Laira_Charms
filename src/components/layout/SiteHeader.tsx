"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Icon } from "@/components/ui/Icon";
import { isLiveSupabaseConfigured } from "@/lib/auth/offline-mode";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/lib/auth/auth-actions";

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount, openDrawer } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authState, setAuthState] = useState<{
    signedIn: boolean;
    isAdmin: boolean;
  }>({
    signedIn: false,
    isAdmin: false,
  });

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
      {/* Main Navigation Bar (Flush at top of viewport) */}
      <header className="sticky top-0 z-50 border-b border-[#2C1E16]/10 bg-[#FFF9F5]/95 backdrop-blur-md">
        <div className="h-16 md:h-20 max-w-[1240px] mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 shrink group min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-[#2C1E16] flex items-center justify-center text-[#FFF9F5] group-hover:bg-[#A62C4B] transition-colors shrink-0">
              <Icon name="pets" className="text-[19px] sm:text-[21px]" aria-hidden="true" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline text-[17px] sm:text-[20px] md:text-headline-sm text-[#2C1E16] font-bold tracking-tight leading-none group-hover:text-[#A62C4B] transition-colors truncate">
                Laira Charms
              </span>
              <span className="hidden sm:block font-label-sm text-[10px] md:text-label-sm text-[#2C1E16]/65 tracking-[0.14em] uppercase mt-0.5 truncate">
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
                  className={`px-3.5 py-2 text-label-lg font-label-lg rounded-md transition-colors ${
                    isActive
                      ? "text-[#A62C4B] font-bold underline underline-offset-8 decoration-2"
                      : "text-[#2C1E16]/80 hover:text-[#2C1E16] hover:bg-[#2C1E16]/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Utility Icons */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Search Input */}
            <form
              action="/search"
              method="GET"
              className="hidden sm:flex items-center bg-[#FFF9F5] hover:border-[#2C1E16]/35 rounded-md px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#A62C4B]/25 focus-within:border-[#A62C4B] transition-all border border-[#2C1E16]/15"
            >
              <Icon name="search" className="text-[#2C1E16]/60 text-[18px] mr-1.5" aria-hidden="true" />
              <input
                type="text"
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find charms..."
                className="bg-transparent border-0 outline-none font-body-sm text-body-sm text-[#2C1E16] placeholder:text-[#2C1E16]/50 w-28 lg:w-36 p-0 focus:ring-0"
                aria-label="Search charms"
              />
            </form>

            {/* Currency Label */}
            <span className="hidden lg:inline-block px-2 text-[11px] font-semibold tracking-wider text-[#2C1E16]/70 uppercase cursor-default">
              PKR
            </span>

            {/* Desktop Auth Entry Points */}
            <div className="hidden md:flex items-center gap-2">
              {authState.signedIn ? (
                <>
                  {authState.isAdmin && (
                    <Link
                      href="/admin/orders"
                      className="px-2.5 py-1 text-label-sm font-label-sm font-bold bg-[#2C1E16] text-[#FFF9F5] rounded-sm hover:bg-[#A62C4B] transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <form action={signOutAction} className="inline-flex">
                    <button
                      type="submit"
                      className="text-label-sm font-label-sm text-[#2C1E16]/75 hover:text-[#A62C4B] px-2 py-1 rounded-md hover:bg-[#2C1E16]/5 transition-colors cursor-pointer"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-label-sm font-label-sm text-[#2C1E16] hover:text-[#A62C4B] px-2.5 py-1.5 rounded-md hover:bg-[#2C1E16]/5 transition-colors font-semibold"
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Account Profile Link (Always retained for test & navigation parity) */}
            <Link
              href="/account"
              className="w-10 h-10 rounded-md bg-transparent text-[#2C1E16] flex items-center justify-center hover:bg-[#2C1E16]/5 hover:text-[#A62C4B] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A62C4B]"
              aria-label="Account Profile"
              title="Account Profile"
            >
              <Icon name="person" className="text-[20px]" aria-hidden="true" />
            </Link>

            {/* Shopping Bag Trigger Button */}
            <button
              onClick={openDrawer}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#A62C4B] hover:bg-[#2C1E16] text-[#FFF9F5] rounded-md px-3 py-2 font-label-md text-label-md transition-colors active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A62C4B] focus-visible:ring-offset-2"
            >
              <Icon name="shopping_bag" className="text-[18px]" aria-hidden="true" />
              <span className="font-bold hidden sm:inline">Bag</span>
              <span
                className="bg-[#FFF9F5] text-[#2C1E16] font-bold rounded-sm min-w-[20px] h-5 px-1 flex items-center justify-center text-label-sm font-label-sm"
                aria-hidden="true"
              >
                {itemCount}
              </span>
              <span className="sr-only"> - Open shopping bag, {itemCount} items</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-md bg-transparent border border-[#2C1E16]/20 flex items-center justify-center text-[#2C1E16] hover:bg-[#2C1E16]/5 transition-colors shrink-0"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <Icon name={isMobileMenuOpen ? "close" : "menu"} className="text-[20px]" aria-hidden="true" />
            </button>
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
              className="fixed inset-0 bg-[#2C1E16]/45 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            <div className="fixed inset-y-0 left-0 max-w-full flex pr-12">
              <div className="w-screen max-w-xs bg-[#FFF9F5] shadow-2xl flex flex-col border-r border-[#2C1E16]/15">
                {/* Header inside mobile drawer */}
                <div className="p-5 border-b border-[#2C1E16]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-[#2C1E16] flex items-center justify-center text-[#FFF9F5]">
                      <Icon name="pets" className="text-[18px]" aria-hidden="true" />
                    </div>
                    <span className="font-headline font-bold text-lg text-[#2C1E16]">
                      Laira Charms
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-9 h-9 rounded-md text-[#2C1E16]/70 hover:text-[#2C1E16] hover:bg-[#2C1E16]/5 flex items-center justify-center transition-colors"
                    aria-label="Close mobile menu"
                  >
                    <Icon name="close" className="text-[18px]" aria-hidden="true" />
                  </button>
                </div>

                {/* Navigation Links inside Drawer */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-md text-label-lg font-label-lg transition-colors ${
                          isActive
                            ? "border-l-2 border-[#A62C4B] bg-[#2C1E16]/5 text-[#A62C4B] font-bold"
                            : "text-[#2C1E16] hover:bg-[#2C1E16]/5"
                        }`}
                      >
                        <span>{link.label}</span>
                        <Icon name="arrow_forward" className="text-[16px] text-[#2C1E16]/50" aria-hidden="true" />
                      </Link>
                    );
                  })}

                  <div className="pt-4 mt-4 border-t border-[#2C1E16]/10 space-y-2">
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-md text-label-lg text-[#2C1E16] hover:bg-[#2C1E16]/5 font-medium"
                    >
                      <Icon name="person" className="text-[20px] text-[#A62C4B]" aria-hidden="true" />
                      <span>My Account &amp; Orders</span>
                    </Link>

                    {/* Mobile Auth Entry Points */}
                    {authState.signedIn ? (
                      <div className="space-y-1.5 pt-1">
                        {authState.isAdmin && (
                          <Link
                            href="/admin/orders"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center justify-between px-4 py-3 rounded-md text-label-lg font-bold bg-[#2C1E16] text-[#FFF9F5]"
                          >
                            <span>Admin Portal</span>
                            <Icon name="arrow_forward" className="text-[16px]" aria-hidden="true" />
                          </Link>
                        )}
                        <form action={signOutAction} className="w-full">
                          <button
                            type="submit"
                            className="w-full flex items-center justify-center px-4 py-2.5 rounded-md text-label-md font-medium text-[#2C1E16]/75 hover:text-[#A62C4B] hover:bg-[#2C1E16]/5 transition-colors cursor-pointer"
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
                          className="flex items-center justify-center py-2.5 px-3 rounded-md border border-[#2C1E16]/25 text-[#2C1E16] text-label-md font-bold hover:bg-[#2C1E16]/5 transition-colors text-center"
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-center py-2.5 px-3 rounded-md bg-[#A62C4B] text-[#FFF9F5] text-label-md font-bold hover:bg-[#2C1E16] transition-colors text-center"
                        >
                          Create account
                        </Link>
                      </div>
                    )}

                    <div className="p-4 mt-4 rounded-md border border-[#2C1E16]/15 text-center space-y-1">
                      <span className="font-label-sm text-label-sm text-[#2C1E16]/65 uppercase tracking-wider block">
                        Pakistani D2C Atelier
                      </span>
                      <span className="font-title-sm text-title-sm text-[#2C1E16] font-bold block">
                        Tracked Delivery via PostEx &amp; TCS
                      </span>
                      <span className="text-body-sm text-[#2C1E16]/70 block">
                        7 to 14 business days studio crafting
                      </span>
                    </div>
                  </div>
                </div>

                {/* Search bar inside drawer */}
                <div className="p-4 border-t border-[#2C1E16]/10">
                  <form action="/search" method="GET" className="relative">
                    <input
                      type="text"
                      name="q"
                      placeholder="Search charms..."
                      className="w-full bg-[#FFF9F5] border border-[#2C1E16]/20 rounded-md px-4 py-2.5 text-body-sm text-[#2C1E16] placeholder:text-[#2C1E16]/50 focus:outline-none focus:ring-2 focus:ring-[#A62C4B]/25 focus:border-[#A62C4B]"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2C1E16]/60 hover:text-[#A62C4B]"
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
