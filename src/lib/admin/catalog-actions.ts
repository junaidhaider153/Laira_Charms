"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { guardAdmin } from "@/lib/auth/guards";
import { isLiveSupabaseConfigured } from "@/lib/auth/offline-mode";
import {
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  updateProductStock,
  updateProductPrice,
  toggleProductStatus,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./catalog-admin-service";
import type { ProductStatus, CatalogProduct } from "@/lib/catalog/types";

const createProductSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().min(5, "Description must be at least 5 characters"),
  categoryId: z.string().nullable().optional(),
  productType: z.enum(["ready_made", "customizable", "bespoke_quote"] as [CatalogProduct["productType"], ...CatalogProduct["productType"][]]).default("ready_made"),
  basePriceMinor: z.number().int().min(100, "Price must be at least 1 PKR (100 paisa)"),
  stockMode: z.enum(["tracked", "unlimited", "made_to_order"] as [CatalogProduct["stockMode"], ...CatalogProduct["stockMode"][]]).default("tracked"),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative").default(0),
  leadTimeDays: z.number().int().min(7, "Production lead time must be between 7 and 14 days").max(14, "Production lead time must be between 7 and 14 days").default(7),
  isFeatured: z.boolean().default(false),
  status: z.enum(["published", "draft", "archived"] as [ProductStatus, ...ProductStatus[]]).default("draft"),
  primaryImage: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

const updateProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  title: z.string().min(2).optional(),
  slug: z.string().optional(),
  description: z.string().min(5).optional(),
  categoryId: z.string().nullable().optional(),
  productType: z.enum(["ready_made", "customizable", "bespoke_quote"] as [CatalogProduct["productType"], ...CatalogProduct["productType"][]]).optional(),
  basePriceMinor: z.number().int().min(100).optional(),
  stockMode: z.enum(["tracked", "unlimited", "made_to_order"] as [CatalogProduct["stockMode"], ...CatalogProduct["stockMode"][]]).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  leadTimeDays: z.number().int().min(7, "Production lead time must be between 7 and 14 days").max(14, "Production lead time must be between 7 and 14 days").optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["published", "draft", "archived"] as [ProductStatus, ...ProductStatus[]]).optional(),
  primaryImage: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

const deleteProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

const updateStockSchema = z.object({
  productId: z.string().min(1),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
});

const updatePriceSchema = z.object({
  productId: z.string().min(1),
  basePriceMinor: z.number().int().min(100, "Price must be at least 1 PKR (100 paisa)"),
});

const toggleStatusSchema = z.object({
  productId: z.string().min(1),
  status: z.enum(["published", "draft", "archived"] as [ProductStatus, ...ProductStatus[]]),
});

const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

const updateCategorySchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

const deleteCategorySchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
});

export async function createProductAction(input: CreateProductInput) {
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid product details.",
    };
  }

  try {
    await guardAdmin("/admin/products");
    const product = await createAdminProduct(parsed.data);
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/shop");
    revalidatePath("/");
    return {
      success: true,
      message: `Product "${product.title}" created successfully.`,
      product,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create product.";
    return { success: false, message };
  }
}

export async function updateProductAction(input: { productId: string } & UpdateProductInput) {
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid product update payload.",
    };
  }

  try {
    await guardAdmin("/admin/products");
    const { productId, ...fields } = parsed.data;
    const product = await updateAdminProduct(productId, fields);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/products");
    revalidatePath("/shop");
    revalidatePath("/");
    return {
      success: true,
      message: `Product "${product.title}" updated successfully.`,
      product,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update product.";
    return { success: false, message };
  }
}

export async function deleteProductAction(input: { productId: string }) {
  const parsed = deleteProductSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid product ID.",
    };
  }

  try {
    await guardAdmin("/admin/products");
    await deleteAdminProduct(parsed.data.productId);
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/shop");
    revalidatePath("/");
    return {
      success: true,
      message: "Product removed from catalog.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete product.";
    return { success: false, message };
  }
}

export async function updateProductStockAction(input: {
  productId: string;
  stockQuantity: number;
}) {
  const parsed = updateStockSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message || "Invalid stock value." };
  }

  try {
    await guardAdmin("/admin/products");
    const product = await updateProductStock(parsed.data.productId, parsed.data.stockQuantity);
    revalidatePath("/admin/products");
    return { success: true, message: `Stock for ${product.title} updated to ${product.stockQuantity}.`, product };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update stock.";
    return { success: false, message };
  }
}

export async function updateProductPriceAction(input: {
  productId: string;
  basePriceMinor: number;
}) {
  const parsed = updatePriceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message || "Invalid price value." };
  }

  try {
    await guardAdmin("/admin/products");
    const product = await updateProductPrice(parsed.data.productId, parsed.data.basePriceMinor);
    revalidatePath("/admin/products");
    return { success: true, message: `Price updated for ${product.title}.`, product };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update price.";
    return { success: false, message };
  }
}

export async function toggleProductStatusAction(input: {
  productId: string;
  status: ProductStatus;
}): Promise<{ success: boolean; message: string; product?: CatalogProduct }> {
  const parsed = toggleStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message || "Invalid status." };
  }

  try {
    await guardAdmin("/admin/products");
    const product = await toggleProductStatus(parsed.data.productId, parsed.data.status);
    revalidatePath("/admin/products");
    return { success: true, message: `Status for ${product.title} changed to ${product.status}.`, product };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update status.";
    return { success: false, message };
  }
}

export async function createCategoryAction(input: CreateCategoryInput) {
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid category details.",
    };
  }

  try {
    await guardAdmin("/admin/categories");
    const category = await createAdminCategory(parsed.data);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return {
      success: true,
      message: `Category "${category.name}" created successfully.`,
      category,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create category.";
    return { success: false, message };
  }
}

export async function updateCategoryAction(input: { categoryId: string } & UpdateCategoryInput) {
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid category update payload.",
    };
  }

  try {
    await guardAdmin("/admin/categories");
    const { categoryId, ...fields } = parsed.data;
    const category = await updateAdminCategory(categoryId, fields);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return {
      success: true,
      message: `Category "${category.name}" updated successfully.`,
      category,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update category.";
    return { success: false, message };
  }
}

export async function deleteCategoryAction(input: { categoryId: string }) {
  const parsed = deleteCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid category ID.",
    };
  }

  try {
    await guardAdmin("/admin/categories");
    await deleteAdminCategory(parsed.data.categoryId);
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return {
      success: true,
      message: "Category removed successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete category.";
    return { success: false, message };
  }
}

export async function uploadProductMediaAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    await guardAdmin("/admin/products");
  } catch {
    return { success: false, message: "Unauthorized. Admin privileges required." };
  }

  const file = formData.get("file") as File | null;
  if (!file || typeof file !== "object" || !("size" in file) || Number((file as unknown as { size: number }).size) === 0) {
    return { success: false, message: "No image file provided." };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { success: false, message: "Image exceeds 10 MB limit." };
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowed.includes(file.type)) {
    return { success: false, message: "Invalid image format. Allowed: JPG, PNG, WebP, AVIF." };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `products/${Date.now()}_${safeName}`;

  if (isLiveSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabaseAdmin.storage
        .from("product-media")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        return { success: false, message: `Upload failed: ${uploadError.message}` };
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("product-media")
        .getPublicUrl(filePath);

      return { success: true, url: publicUrlData.publicUrl };
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : "Upload error" };
    }
  }

  // Offline mock mode for tests/development
  return { success: true, url: `/images/${safeName}` };
}
