"use server";

import {
  saveAddress,
  deleteAddress,
  setDefaultAddress,
  addressSchema,
  SAMPLE_CUSTOMER_USER_ID,
} from "./address-service";
import type { SaveAddressInput } from "./types";
import { isLiveSupabaseConfigured, allowOfflineFallback } from "@/lib/auth/offline-mode";

async function resolveCustomerUserId(): Promise<string> {
  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return user.id;
      }
      throw new Error("Please sign in to manage your addresses.");
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Please sign in")) {
        throw err;
      }
      throw new Error("Please sign in to manage your addresses.");
    }
  }

  // Local development / mock fallback only
  if (allowOfflineFallback()) {
    return SAMPLE_CUSTOMER_USER_ID;
  }

  throw new Error("Please sign in to manage your addresses.");
}

export async function saveAddressAction(input: SaveAddressInput) {
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message || "Invalid address details.",
    };
  }

  try {
    const userId = await resolveCustomerUserId();
    const address = await saveAddress(userId, parsed.data);

    return {
      success: true,
      message: parsed.data.id ? "Address updated successfully." : "New delivery address saved.",
      address,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save address.";
    return {
      success: false,
      message,
    };
  }
}

export async function deleteAddressAction(addressId: string) {
  try {
    const userId = await resolveCustomerUserId();
    await deleteAddress(userId, addressId);

    return {
      success: true,
      message: "Address removed from address book.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete address.";
    return {
      success: false,
      message,
    };
  }
}

export async function setDefaultAddressAction(addressId: string) {
  try {
    const userId = await resolveCustomerUserId();
    const address = await setDefaultAddress(userId, addressId);

    return {
      success: true,
      message: "Default delivery address updated.",
      address,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to set default address.";
    return {
      success: false,
      message,
    };
  }
}

