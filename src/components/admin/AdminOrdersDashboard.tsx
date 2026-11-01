"use client";

import React, { useState, useMemo } from "react";
import { AdminOrderFilters } from "./AdminOrderFilters";
import { AdminOrderTable } from "./AdminOrderTable";
import type { Order } from "@/lib/checkout/types";
import type { OrderStatus } from "@/lib/order/lifecycle";

interface AdminOrdersDashboardProps {
  initialOrders: Order[];
  initialCounts: Record<string, number>;
}

export function AdminOrdersDashboard({
  initialOrders,
  initialCounts,
}: AdminOrdersDashboardProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      // Status filter
      if (currentStatus !== "all" && order.orderStatus !== currentStatus) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = order.reference.toLowerCase().includes(q);
        const matchesName = order.shippingAddressSnapshot.fullName.toLowerCase().includes(q);
        const matchesPhone = order.shippingAddressSnapshot.phone.includes(q);
        const matchesCity = order.shippingAddressSnapshot.city.toLowerCase().includes(q);
        return matchesRef || matchesName || matchesPhone || matchesCity;
      }

      return true;
    });
  }, [initialOrders, currentStatus, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="font-headline font-bold text-3xl text-espresso-deep">
          Studio Orders Queue
        </h1>
        <p className="text-xs sm:text-sm text-espresso-muted mt-1">
          Monitor incoming keepsake commissions, cross-reference payment proofs, and progress crafting stages.
        </p>
      </div>

      <AdminOrderFilters
        currentStatus={currentStatus}
        onStatusChange={setCurrentStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        counts={initialCounts}
      />

      <AdminOrderTable orders={filteredOrders} />
    </div>
  );
}

