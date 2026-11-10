import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { guardAdmin } from "@/lib/auth/guards";
import { signOutAction } from "@/lib/auth/auth-actions";

export const metadata: Metadata = {
  title: "Admin Portal | Laira Charms",
  description: "Administrative studio management portal for orders, inquiries, and atelier fulfillment.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardAdmin("/admin/orders");
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
            <span className="px-3 py-1 rounded-full bg-strawberry-blush text-on-primary text-[10px] font-bold tracking-wider uppercase shadow-xs">
              Admin Portal
            </span>
          </div>

          <nav className="flex items-center gap-2.5 text-xs font-semibold overflow-x-auto py-1">
            <Link
              href="/admin/orders"
              className="px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              Orders
            </Link>
            <Link
              href="/admin/products"
              className="px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              Catalog
            </Link>
            <Link
              href="/admin/inquiries"
              className="px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              Inquiries
            </Link>
            <Link
              href="/admin/conversations"
              className="px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              Inbox
            </Link>
            <Link
              href="/shop"
              target="_blank"
              className="text-white/80 hover:text-white transition-colors flex items-center gap-1 ml-1 whitespace-nowrap"
            >
              <span>Storefront</span>
              <span className="text-[10px]">↗</span>
            </Link>
            <form action={signOutAction} className="inline-flex ml-2">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-full bg-red-900/60 text-red-100 hover:bg-red-800 transition-colors whitespace-nowrap text-xs font-semibold cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1">{children}</div>
    </div>
  );
}

