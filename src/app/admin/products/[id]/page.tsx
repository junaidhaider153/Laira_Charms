import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { guardAdmin } from "@/lib/auth/guards";
import { getAdminProduct, listAdminCategories } from "@/lib/admin/catalog-admin-service";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Product | Admin Portal - Laira Charms",
  description: "Update product pricing, images, and keepsake configuration.",
};

interface AdminEditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: AdminEditProductPageProps) {
  const { id } = await params;
  await guardAdmin(`/admin/products/${id}`);

  const product = await getAdminProduct(id);
  if (!product) {
    notFound();
  }

  const categories = await listAdminCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductForm initialProduct={product} categories={categories} />
    </div>
  );
}

