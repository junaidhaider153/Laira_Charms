"use server";

import { z } from "zod";
import {
  updateProductStock,
  updateProductPrice,
  toggleProductStatus,
} from "./catalog-admin-service";
import type { ProductStatus } from "@/lib/catalog/types";

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

async function verifyAdminAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLiveSupabase = Boolean(
    supabaseUrl && !supabaseUrl.includes("dummy-project") && !supabaseUrl.includes("example.com")
  );

  if (isLiveSupabase) {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized. Admin authentication required.");
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if ((profile as { role?: string } | null)?.role !== "admin") {
      throw new Error("Forbidden. Admin privileges required.");
    }
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
    await verifyAdminAuth();
    const product = await updateProductStock(parsed.data.productId, parsed.data.stockQuantity);
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
    await verifyAdminAuth();
    const product = await updateProductPrice(parsed.data.productId, parsed.data.basePriceMinor);
    return { success: true, message: `Price updated for ${product.title}.`, product };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update price.";
    return { success: false, message };
  }
}

export async function toggleProductStatusAction(input: {
  productId: string;
  status: ProductStatus;
}) {
  const parsed = toggleStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.errors[0]?.message || "Invalid status." };
  }

  try {
    await verifyAdminAuth();
    const product = await toggleProductStatus(parsed.data.productId, parsed.data.status);
    return { success: true, message: `Status for ${product.title} changed to ${product.status}.`, product };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update status.";
    return { success: false, message };
  }
}
