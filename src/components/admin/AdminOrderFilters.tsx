"use client";

import React from "react";
import type { OrderStatus } from "@/lib/order/lifecycle";

interface AdminOrderFiltersProps {
  currentStatus: OrderStatus | "all";
  onStatusChange: (status: OrderStatus | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: Record<string, number>;
}

const TABS: Array<{ id: OrderStatus | "all"; label: string }> = [
  { id: "all", label: "All Orders" },
  { id: "awaiting_verification", label: "Payment Verification" },
  { id: "confirmed", label: "Confirmed" },
  { id: "in_production", label: "In Production" },
  { id: "ready_to_ship", label: "Ready to Ship" },
  { id: "shipped", label: "Dispatched" },
  { id: "delivered", label: "Delivered" },
  { id: "on_hold", label: "On Hold" },
];

export function AdminOrderFilters({
  currentStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  counts,
}: AdminOrderFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-espresso-muted">
          🔍
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by reference (LC-...), customer name, phone number, or city..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-border-warm bg-canvas-butter text-espresso-deep text-xs focus:outline-none focus:ring-2 focus:ring-strawberry-blush focus:border-transparent transition-all placeholder:text-espresso-muted/50"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-espresso-muted hover:text-espresso-deep"
          >
            Clear
          </button>
        )}
      </div>

      {/* Status Filter Tab Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab) => {
          const isActive = currentStatus === tab.id;
          const count = counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border active:scale-95 ${
                isActive
                  ? "bg-strawberry-blush text-on-primary border-strawberry-blush shadow-xs"
                  : "bg-surface-cloud border-border-warm text-espresso-muted hover:text-espresso-deep hover:bg-surface-custard"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive
                    ? "bg-white/25 text-white font-bold"
                    : "bg-peach-tint text-strawberry-blush-dark font-bold"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

