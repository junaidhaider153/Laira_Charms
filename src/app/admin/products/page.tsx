import React from "react";
import { Metadata } from "next";
import { listAdminProducts } from "@/lib/admin/catalog-admin-service";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";

export const metadata: Metadata = {
  title: "Catalog & Inventory | Admin Portal - Laira Charms",
  description: "Manage product stock, pricing, and catalog publication status.",
};

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminProductsTable initialProducts={products} />
    </div>
  );
}

