import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | Laira Charms",
  description: "Administrative studio management portal for orders, inquiries, and atelier fulfillment.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas-butter flex flex-col">
      {/* Admin Top Navigation Bar */}
      <header className="bg-espresso-deep text-white border-b border-border-warm/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/orders" className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <span className="font-headline font-bold text-lg text-white tracking-tight">
                Laira Charms
              </span>
            </Link>
            <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold tracking-wider uppercase">
              Admin Portal
            </span>
          </div>

          <nav className="flex items-center gap-3 text-xs font-semibold">
            <Link
              href="/admin/orders"
              className="px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Orders Queue
            </Link>
            <Link
              href="/admin/conversations"
              className="px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Studio Inbox
            </Link>
            <Link
              href="/shop"
              target="_blank"
              className="text-white/80 hover:text-white transition-colors flex items-center gap-1 ml-2"
            >
              <span>View Storefront</span>
              <span className="text-[10px]">↗</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>
    </div>
  );
}

