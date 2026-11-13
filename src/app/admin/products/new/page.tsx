import React from "react";
import { Metadata } from "next";
import { guardAdmin } from "@/lib/auth/guards";
import { listAdminCategories } from "@/lib/admin/catalog-admin-service";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Product | Admin Portal - Laira Charms",
  description: "Create and publish a new handcrafted keepsake in the store catalog.",
};

export default async function AdminNewProductPage() {
  await guardAdmin("/admin/products/new");
  const categories = await listAdminCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductForm categories={categories} />
    </div>
  );
}

