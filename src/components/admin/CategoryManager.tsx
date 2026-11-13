"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CatalogCategory } from "@/lib/catalog/types";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/lib/admin/catalog-actions";

interface CategoryManagerProps {
  initialCategories: CatalogCategory[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<CatalogCategory[]>(initialCategories);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);

  // Form states for create/edit
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const resetForm = () => {
    setIsEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setSortOrder(categories.length + 1);
  };

  const handleStartEdit = (cat: CatalogCategory) => {
    setIsEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImageUrl(cat.imageUrl || "");
    setSortOrder(cat.sortOrder);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (isEditingId) {
        const result = await updateCategoryAction({
          categoryId: isEditingId,
          name,
          slug: slug.trim() || undefined,
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          sortOrder: Number(sortOrder),
        });

        if (result.success && result.category) {
          setCategories((prev) =>
            prev.map((c) => (c.id === isEditingId ? result.category! : c))
          );
          setFeedback({ type: "success", message: result.message });
          resetForm();
        } else {
          setFeedback({ type: "error", message: result.message });
        }
      } else {
        const result = await createCategoryAction({
          name,
          slug: slug.trim() || undefined,
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null,
          sortOrder: Number(sortOrder),
        });

        if (result.success && result.category) {
          setCategories((prev) => [...prev, result.category!]);
          setFeedback({ type: "success", message: result.message });
          resetForm();
        } else {
          setFeedback({ type: "error", message: result.message });
        }
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save category.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      return;
    }

    setFeedback(null);
    const result = await deleteCategoryAction({ categoryId: id });
    if (result.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setFeedback({ type: "success", message: result.message });
      if (isEditingId === id) resetForm();
    } else {
      setFeedback({ type: "error", message: result.message });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-3xl text-espresso-deep">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1">
            Organize keepsakes by collection, configure URLs, and set showcase photography.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-semibold text-espresso-deep hover:text-strawberry-deep border border-border-warm rounded-full px-4 py-2 hover:bg-canvas-pearl transition-colors"
        >
          ← Back to Catalog Products
        </Link>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-secondary/15 text-secondary border border-secondary/30"
              : "bg-error/10 text-error border border-error/30"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="bg-canvas-butter/60 p-6 rounded-3xl border border-border-warm/60 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline font-bold text-lg text-espresso-deep">
              {isEditingId ? "Edit Category" : "Add New Category"}
            </h2>
            {isEditingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-espresso-muted hover:text-espresso-deep underline cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bag Charms & Phone Charms"
                className="w-full text-xs rounded-xl border border-border-warm bg-white px-3.5 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-1">
                Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="bag-charms-phone-charms"
                className="w-full text-xs rounded-xl border border-border-warm bg-white px-3.5 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description for collection cards and SEO..."
                className="w-full text-xs rounded-xl border border-border-warm bg-white px-3.5 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/images/category-ready-made.jpg"
                className="w-full text-xs rounded-xl border border-border-warm bg-white px-3.5 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-espresso-deep uppercase tracking-wider mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-border-warm bg-white px-3.5 py-2.5 text-espresso-deep focus:outline-none focus:ring-2 focus:ring-strawberry-blush"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-strawberry-deep text-white text-xs font-bold hover:bg-strawberry-blush transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting
                ? "Saving..."
                : isEditingId
                ? "Update Category"
                : "Create Category"}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-canvas-butter/40 rounded-3xl border border-border-warm/60 overflow-hidden shadow-xs">
            <div className="divide-y divide-border-warm/30">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-canvas-butter/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-border-warm bg-canvas-pearl shrink-0">
                      <Image
                        src={cat.imageUrl || "/images/placeholder.jpg"}
                        alt={cat.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline font-bold text-sm text-espresso-deep">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-canvas-pearl border border-border-warm text-espresso-muted">
                          order: {cat.sortOrder}
                        </span>
                      </div>
                      <p className="text-xs text-espresso-muted line-clamp-1 mt-0.5">
                        {cat.description || "No description provided."}
                      </p>
                      <span className="text-[10px] text-strawberry-deep font-mono">
                        /shop?category={cat.slug}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="px-3 py-1.5 rounded-full border border-border-warm text-xs font-semibold text-espresso-deep hover:bg-white transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="px-3 py-1.5 rounded-full border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {categories.length === 0 && (
                <div className="p-8 text-center text-xs text-espresso-muted">
                  No categories defined yet. Add your first category using the form on the left.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

