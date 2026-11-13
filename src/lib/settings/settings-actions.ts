"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { guardAdmin } from "@/lib/auth/guards";
import {
  updateStoreSetting,
  getAllStoreSettings,
  AllStoreSettings,
} from "./settings-service";

const shippingSettingsSchema = z.object({
  standardRatePkr: z.number().int().min(0, "Shipping fee cannot be negative"),
  freeShippingThresholdPkr: z.number().int().min(0, "Free delivery threshold cannot be negative"),
  estimatedDays: z.string().min(2, "Estimated delivery days required"),
  couriers: z.string().min(2, "Couriers description required"),
});

const bannerSettingsSchema = z.object({
  text: z.string().min(3, "Banner text must be at least 3 characters"),
  isEnabled: z.boolean(),
});

const paymentSettingsSchema = z.object({
  bankName: z.string().min(2, "Bank name required"),
  accountTitle: z.string().min(2, "Account title required"),
  accountNumber: z.string().min(5, "Account number required"),
  iban: z.string().min(10, "IBAN required"),
  instructions: z.string().min(10, "Instructions required"),
});

export async function getStoreSettingsAction(): Promise<{
  success: boolean;
  settings?: AllStoreSettings;
  message?: string;
}> {
  try {
    await guardAdmin("/admin/settings");
    const settings = await getAllStoreSettings();
    return { success: true, settings };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load store settings.";
    return { success: false, message };
  }
}

export async function updateShippingSettingsAction(input: {
  standardRatePkr: number;
  freeShippingThresholdPkr: number;
  estimatedDays: string;
  couriers: string;
}) {
  const parsed = shippingSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid shipping settings.",
    };
  }

  try {
    await guardAdmin("/admin/settings");
    await updateStoreSetting("shipping_policy", {
      standard_rate_minor: parsed.data.standardRatePkr * 100,
      free_shipping_threshold_minor: parsed.data.freeShippingThresholdPkr * 100,
      estimated_days: parsed.data.estimatedDays,
      couriers: parsed.data.couriers,
    });

    revalidatePath("/admin/settings");
    revalidatePath("/shipping");
    revalidatePath("/shop");
    revalidatePath("/");
    return {
      success: true,
      message: "Shipping policy updated successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update shipping policy.";
    return { success: false, message };
  }
}

export async function updateBannerSettingsAction(input: {
  text: string;
  isEnabled: boolean;
}) {
  const parsed = bannerSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid banner settings.",
    };
  }

  try {
    await guardAdmin("/admin/settings");
    await updateStoreSetting("announcement_banner", {
      text: parsed.data.text,
      is_enabled: parsed.data.isEnabled,
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/shop");
    return {
      success: true,
      message: "Announcement banner updated successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update announcement banner.";
    return { success: false, message };
  }
}

export async function updatePaymentSettingsAction(input: {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  instructions: string;
}) {
  const parsed = paymentSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid payment instructions.",
    };
  }

  try {
    await guardAdmin("/admin/settings");
    await updateStoreSetting("payment_instructions", {
      bank_name: parsed.data.bankName,
      account_title: parsed.data.accountTitle,
      account_number: parsed.data.accountNumber,
      iban: parsed.data.iban,
      instructions: parsed.data.instructions,
    });

    revalidatePath("/admin/settings");
    return {
      success: true,
      message: "Payment instructions updated successfully.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update payment instructions.";
    return { success: false, message };
  }
}

