"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import type { CatalogProduct, ProductStatus } from "@/lib/catalog/types";
import {
  updateProductStockAction,
  toggleProductStatusAction,
} from "@/lib/admin/catalog-actions";

interface AdminProductsTableProps {
  initialProducts: CatalogProduct[];
}

export function AdminProductsTable({ initialProducts }: AdminProductsTableProps) {
  const [products, setProducts] = useState<CatalogProduct[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const filteredProducts = products.filter((prod) => {
    if (statusFilter !== "all" && prod.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = prod.title.toLowerCase().includes(q);
      const matchCategory = prod.categoryName ? prod.categoryName.toLowerCase().includes(q) : false;
      const matchSlug = prod.slug.toLowerCase().includes(q);
      return matchTitle || matchCategory || matchSlug;
    }
    return true;
  });

  const handleStockChange = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    setUpdatingId(productId);
    setFeedback(null);

    const result = await updateProductStockAction({ productId, stockQuantity: newStock });
    if (!result.success || !result.product) {
      setFeedback({ type: "error", message: result.message });
      setUpdatingId(null);
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stockQuantity: result.product!.stockQuantity } : p))
    );
    setFeedback({ type: "success", message: result.message });
    setUpdatingId(null);
  };

  const handleStatusChange = async (productId: string, newStatus: ProductStatus) => {
    setUpdatingId(productId);
    setFeedback(null);

    const result = await toggleProductStatusAction({ productId, status: newStatus });
    if (!result.success || !result.product) {
      setFeedback({ type: "error", message: result.message });
      setUpdatingId(null);
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: result.product!.status } : p))
    );
    setFeedback({ type: "success", message: result.message });
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-3xl text-espresso-deep">
            Artisanal Catalog &amp; Inventory
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1">
            Manage keepsake collection items, update live in-stock counts, and adjust pricing.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-secondary/15 text-secondary border border-secondary/30"
              : "bg-error/10 text-error border border-error/30"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products by title, category, or slug..."
          className="w-full sm:flex-1 px-4 py-2.5 rounded-2xl border border-border-warm bg-surface-cloud text-xs text-espresso-deep focus:ring-2 focus:ring-primary"
        />

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["all", "published", "draft", "archived"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors border ${
                statusFilter === st
                  ? "bg-espresso-deep text-white border-espresso-deep"
                  : "bg-surface-cloud text-espresso-muted border-border-warm hover:text-espresso-deep"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-surface-custard border border-border-warm shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-espresso-deep">
          <thead className="bg-surface-cloud border-b border-border-warm text-espresso-muted uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Category &amp; Type</th>
              <th className="py-3.5 px-4">Base Price</th>
              <th className="py-3.5 px-4">Stock Qty</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Storefront</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-warm/60">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-espresso-muted">
                  No products found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-surface-cloud/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-surface-cloud overflow-hidden border border-border-warm/60 shrink-0">
                        {prod.media[0]?.publicUrl ? (
                          <Image
                            src={prod.media[0].publicUrl}
                            alt={prod.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">✨</div>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-sm block line-clamp-1">{prod.title}</span>
                        <span className="text-[10px] text-espresso-muted font-mono">{prod.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="block font-medium">{prod.categoryName}</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-surface-cloud border border-border-warm text-espresso-muted">
                      {prod.productType.replace("_", " ")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold whitespace-nowrap">
                    {formatMoney(prod.basePriceMinor)}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={0}
                        defaultValue={prod.stockQuantity}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val !== prod.stockQuantity) {
                            handleStockChange(prod.id, val);
                          }
                        }}
                        disabled={updatingId === prod.id}
                        className="w-16 px-2 py-1 rounded-lg border border-border-warm bg-surface-cloud font-mono text-xs focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-[10px] text-espresso-muted">units</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <select
                      value={prod.status}
                      onChange={(e) => handleStatusChange(prod.id, e.target.value as ProductStatus)}
                      disabled={updatingId === prod.id}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border focus:outline-none ${
                        prod.status === "published"
                          ? "bg-secondary/15 text-secondary border-secondary/30"
                          : prod.status === "draft"
                          ? "bg-surface-cloud text-espresso-muted border-border-warm"
                          : "bg-error/10 text-error border-error/30"
                      }`}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      href={`/products/${prod.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-cloud border border-border-warm text-espresso-deep font-bold text-xs hover:bg-surface-container transition-colors"
                    >
                      <span>View</span>
                      <span className="text-[10px]">↗</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
