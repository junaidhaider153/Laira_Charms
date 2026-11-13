import React from "react";
import { Metadata } from "next";
import { guardAdmin } from "@/lib/auth/guards";
import { listAdminCategories } from "@/lib/admin/catalog-admin-service";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories | Admin Portal - Laira Charms",
  description: "Manage product categories and collections.",
};

export default async function AdminCategoriesPage() {
  await guardAdmin("/admin/categories");
  const categories = await listAdminCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CategoryManager initialCategories={categories} />
    </div>
  );
}

