"use server";

import {
  saveAddress,
  deleteAddress,
  setDefaultAddress,
  addressSchema,
  SAMPLE_CUSTOMER_USER_ID,
} from "./address-service";
import type { SaveAddressInput } from "./types";

async function resolveCustomerUserId(): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLiveSupabase = Boolean(
    supabaseUrl && !supabaseUrl.includes("dummy-project") && !supabaseUrl.includes("example.com")
  );

  if (isLiveSupabase) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        return user.id;
      }
    } catch {
      // Fallback
    }
  }

  // Local development / mock fallback
  return SAMPLE_CUSTOMER_USER_ID;
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

