"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { CatalogProduct, CatalogCategory, ProductStatus } from "@/lib/catalog/types";
import { createProductAction, updateProductAction } from "@/lib/admin/catalog-actions";

interface ProductFormProps {
  initialProduct?: CatalogProduct | null;
  categories: CatalogCategory[];
}

export function ProductForm({ initialProduct, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct);

  const [title, setTitle] = useState(initialProduct?.title || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId || "");
  const [productType, setProductType] = useState<CatalogProduct["productType"]>(
    initialProduct?.productType || "ready_made"
  );
  // Store base price in PKR for the user, convert to paisa (1 PKR = 100 paisa)
  const [pricePkr, setPricePkr] = useState<number>(
    initialProduct ? Math.round(initialProduct.basePriceMinor / 100) : 1000
  );
  const [stockQuantity, setStockQuantity] = useState<number>(initialProduct?.stockQuantity ?? 10);
  const [stockMode, setStockMode] = useState<CatalogProduct["stockMode"]>(
    initialProduct?.stockMode || "tracked"
  );
  const [leadTimeDays, setLeadTimeDays] = useState<number>(initialProduct?.leadTimeDays ?? 3);
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status || "draft");
  const [isFeatured, setIsFeatured] = useState<boolean>(initialProduct?.isFeatured || false);

  // Images list
  const [images, setImages] = useState<string[]>(
    initialProduct?.media?.map((m) => m.publicUrl) ||
      (initialProduct?.primaryImage ? [initialProduct.primaryImage] : ["/images/placeholder.jpg"])
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const basePriceMinor = Math.round(pricePkr * 100);

    if (basePriceMinor < 100) {
      setError("Price must be at least 1 PKR.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditing && initialProduct) {
        const result = await updateProductAction({
          productId: initialProduct.id,
          title,
          slug: slug.trim() || undefined,
          description,
          categoryId: categoryId || null,
          productType,
          basePriceMinor,
          stockMode,
          stockQuantity: Number(stockQuantity),
          leadTimeDays: Number(leadTimeDays),
          status,
          isFeatured,
          primaryImage: images[0] || "/images/placeholder.jpg",
          mediaUrls: images,
        });

        if (!result.success) {
          setError(result.message);
        } else {
          setSuccess(result.message);
          setTimeout(() => {
            router.push("/admin/products");
            router.refresh();
          }, 1200);
        }
      } else {
        const result = await createProductAction({
          title,
          slug: slug.trim() || undefined,
          description,
          categoryId: categoryId || null,
          productType,
          basePriceMinor,
          stockMode,
          stockQuantity: Number(stockQuantity),
          leadTimeDays: Number(leadTimeDays),
          status,
          isFeatured,
          primaryImage: images[0] || "/images/placeholder.jpg",
          mediaUrls: images,
        });

        if (!result.success) {
          setError(result.message);
        } else {
          setSuccess(result.message);
          setTimeout(() => {
            router.push("/admin/products");
            router.refresh();
          }, 1200);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-bold text-2xl sm:text-3xl text-espresso-deep">
            {isEditing ? `Edit Keepsake: ${initialProduct?.title}` : "Add New Keepsake Product"}
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1">
            Fill in the handcrafted product details, artisan pricing, and imagery.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-semibold text-espresso-deep hover:text-strawberry-deep border border-border-warm rounded-full px-4 py-2 hover:bg-canvas-pearl transition-colors"
        >
          ← Back to Catalog
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-error text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 text-secondary text-xs font-semibold">
          {success} Redirecting...
        </div>
      )}

      <div className="bg-canvas-butter/50 p-6 sm:p-8 rounded-3xl border border-border-warm/60 space-y-6 shadow-xs">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daisy Flower Polymer Charm"
              className="w-full text-sm rounded-xl border border-border-warm bg-white px-4 py-3 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              URL Slug (Optional)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="daisy-flower-polymer-charm"
              className="w-full text-sm rounded-xl border border-border-warm bg-white px-4 py-3 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-sm rounded-xl border border-border-warm bg-white px-4 py-3 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the materials, clay finish, UV resin shine, dimensions, and clasps..."
              className="w-full text-sm rounded-xl border border-border-warm bg-white px-4 py-3 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="border-t border-border-warm/40 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Price (PKR) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-xs font-bold text-espresso-muted">Rs.</span>
              <input
                type="number"
                min="1"
                required
                value={pricePkr}
                onChange={(e) => setPricePkr(Number(e.target.value))}
                className="w-full text-sm rounded-xl border border-border-warm bg-white pl-10 pr-4 py-3 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              min="0"
              required
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              className="w-full text-sm rounded-xl border border-border-warm bg-white px-4 py-3 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Lead Time (Days)
            </label>
            <input
              type="number"
              min="0"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(Number(e.target.value))}
              className="w-full text-sm rounded-xl border border-border-warm bg-white px-4 py-3 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Product Type
            </label>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value as CatalogProduct["productType"])}
              className="w-full text-sm rounded-xl border border-border-warm bg-white px-4 py-3 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
            >
              <option value="ready_made">Ready-Made Charm</option>
              <option value="customizable">Personalized Charm</option>
              <option value="bespoke_quote">Made to Order / Bespoke</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Stock Tracking Mode
            </label>
            <select
              value={stockMode}
              onChange={(e) => setStockMode(e.target.value as CatalogProduct["stockMode"])}
              className="w-full text-sm rounded-xl border border-border-warm bg-white px-4 py-3 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
            >
              <option value="tracked">Tracked Inventory</option>
              <option value="unlimited">Unlimited (Always in stock)</option>
              <option value="made_to_order">Made to Order</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-2">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="w-full text-sm rounded-xl border border-border-warm bg-white px-4 py-3 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush font-semibold"
            >
              <option value="draft">Draft (Hidden)</option>
              <option value="published">Published (Live in Store)</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Featured Toggle */}
        <div className="border-t border-border-warm/40 pt-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="isFeatured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-border-warm text-strawberry-deep focus:ring-strawberry-blush"
          />
          <label htmlFor="isFeatured" className="text-xs font-bold text-espresso-deep cursor-pointer">
            Feature this product on homepage highlights
          </label>
        </div>

        {/* Images */}
        <div className="border-t border-border-warm/40 pt-6 space-y-4">
          <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider">
            Product Images &amp; Media
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste public image URL (e.g. Supabase Storage, Cloudinary, Unsplash)"
              className="flex-1 text-xs rounded-xl border border-border-warm bg-white px-4 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2.5 rounded-xl bg-espresso-deep text-white text-xs font-bold hover:bg-espresso-muted transition-colors cursor-pointer"
            >
              Add Image
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative group border border-border-warm rounded-2xl overflow-hidden aspect-square bg-canvas-pearl"
              >
                <Image
                  src={imgUrl}
                  alt={`Product media ${idx + 1}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-espresso-deep/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1.5 rounded-full bg-red-600 text-white text-xs hover:bg-red-700 cursor-pointer"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
                {idx === 0 && (
                  <span className="absolute bottom-2 left-2 bg-strawberry-deep text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin/products"
          className="px-6 py-3 rounded-full text-xs font-bold text-espresso-deep hover:bg-canvas-pearl transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 rounded-full bg-strawberry-deep text-white text-xs font-bold hover:bg-strawberry-blush transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Saving Keepsake..." : isEditing ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
