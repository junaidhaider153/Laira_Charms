import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Laira Charms",
  description: "Manage your artisanal keepsake orders, saved Pakistani delivery addresses, and bespoke inquiries.",
};

const NAV_LINKS = [
  { href: "/account", label: "Overview", icon: "✨" },
  { href: "/account/orders", label: "Order History", icon: "🛍️" },
  { href: "/account/addresses", label: "Saved Addresses", icon: "🏡" },
  { href: "/account/requests", label: "Bespoke Requests", icon: "🎨" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas-butter py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Account Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-custard border border-border-warm/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-peach-tint flex items-center justify-center text-2xl border border-strawberry-blush/20 shrink-0 shadow-xs">
              🌸
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-matcha-tint text-secondary border border-secondary/20 text-[10px] font-bold uppercase tracking-wider">
                Keepsake Collector Club
              </span>
              <h1 className="font-headline font-bold text-2xl sm:text-3xl text-espresso-deep mt-1.5">
                My Studio Account
              </h1>
            </div>
          </div>

          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-full bg-surface-cloud border border-border-warm text-espresso-deep font-bold text-xs hover:bg-surface-container transition-all shadow-xs active:scale-95"
          >
            Explore Catalog &rarr;
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-border-warm/40">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-espresso-deep hover:bg-surface-custard transition-all flex items-center gap-2 whitespace-nowrap border border-transparent hover:border-border-warm/60"
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Main Content View */}
        <div className="min-h-[400px]">{children}</div>
      </div>
    </div>
  );
}

