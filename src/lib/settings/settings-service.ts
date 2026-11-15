import { isLiveSupabaseConfigured } from "@/lib/auth/offline-mode";

export interface ShippingPolicySettings {
  standardRateMinor: number;
  freeShippingThresholdMinor: number;
  estimatedDays: string;
  couriers: string;
}

export interface BannerSettings {
  text: string;
  isEnabled: boolean;
}

export interface PaymentInstructionsSettings {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  instructions: string;
  easypaisaTitle?: string;
  easypaisaNumber?: string;
  jazzcashTitle?: string;
  jazzcashNumber?: string;
}

export interface AllStoreSettings {
  shippingPolicy: ShippingPolicySettings;
  banner: BannerSettings;
  paymentInstructions: PaymentInstructionsSettings;
}

// In-memory defaults matching current store rules
export const DEFAULT_SHIPPING_SETTINGS: ShippingPolicySettings = {
  standardRateMinor: 25000, // Rs. 250
  freeShippingThresholdMinor: 300000, // Rs. 3,000
  estimatedDays: "2 to 4 business days across Pakistan",
  couriers: "PostEx & TCS",
};

export const DEFAULT_BANNER_SETTINGS: BannerSettings = {
  text: "🚚 Free delivery across Pakistan on orders over Rs. 3,000 🍓",
  isEnabled: true,
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentInstructionsSettings = {
  bankName: "Meezan Bank Limited",
  accountTitle: "Laira Charms Workshop",
  accountNumber: "01020304050607",
  iban: "PK00MEZN0001020304050607",
  instructions:
    "Transfer exact order total via online banking or ATM transfer. Upload a clean, legible screenshot showing transaction reference and timestamp.",
};

const MEMORY_STORE_SETTINGS = new Map<string, unknown>([
  ["shipping_policy", DEFAULT_SHIPPING_SETTINGS],
  ["announcement_banner", DEFAULT_BANNER_SETTINGS],
  ["payment_instructions", DEFAULT_PAYMENT_SETTINGS],
]);

/**
 * Retrieves a single setting by key, querying Supabase when live or falling back to memory.
 */
export async function getStoreSetting<T>(key: string, defaultValue: T): Promise<T> {
  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const anyClient = supabase as unknown as {
        from: (table: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => {
              maybeSingle: () => Promise<{ data: { key: string; value: unknown } | null; error: unknown }>;
            };
          };
          upsert: (row: unknown) => Promise<{ error: unknown }>;
        };
      };
      const { data, error } = await anyClient
        .from("store_settings")
        .select("key, value")
        .eq("key", key)
        .maybeSingle();

      if (!error && data && data.value) {
        const val = data.value as unknown as T;
        MEMORY_STORE_SETTINGS.set(key, val);
        return val;
      }
    } catch {
      // Fallback to cache/default
    }
  }

  const cached = MEMORY_STORE_SETTINGS.get(key);
  if (cached !== undefined) {
    return cached as T;
  }
  return defaultValue;
}

/**
 * Updates a store setting by key.
 */
export async function updateStoreSetting<T extends Record<string, unknown>>(
  key: string,
  value: T,
  isPublic = true
): Promise<void> {
  MEMORY_STORE_SETTINGS.set(key, value);

  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();
      const anyClient = supabase as unknown as {
        from: (table: string) => {
          upsert: (row: unknown) => Promise<{ error: unknown }>;
        };
      };
      await anyClient.from("store_settings").upsert({
        key,
        value,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Fallback
    }
  }
}

/**
 * Retrieves current shipping policy settings.
 */
export async function getShippingPolicySettings(): Promise<ShippingPolicySettings> {
  const raw = await getStoreSetting<Record<string, unknown>>(
    "shipping_policy",
    DEFAULT_SHIPPING_SETTINGS as unknown as Record<string, unknown>
  );

  return {
    standardRateMinor: Number(raw.standard_rate_minor ?? raw.standardRateMinor ?? 25000),
    freeShippingThresholdMinor: Number(
      raw.free_shipping_threshold_minor ?? raw.freeShippingThresholdMinor ?? 300000
    ),
    estimatedDays: String(raw.estimated_days ?? raw.estimatedDays ?? "2 to 4 business days across Pakistan"),
    couriers: String(raw.couriers ?? "PostEx & TCS"),
  };
}

/**
 * Retrieves announcement banner settings.
 */
export async function getBannerSettings(): Promise<BannerSettings> {
  const raw = await getStoreSetting<Record<string, unknown>>(
    "announcement_banner",
    DEFAULT_BANNER_SETTINGS as unknown as Record<string, unknown>
  );

  return {
    text: String(raw.text ?? DEFAULT_BANNER_SETTINGS.text),
    isEnabled: Boolean(raw.is_enabled ?? raw.isEnabled ?? true),
  };
}

/**
 * Retrieves all store settings for admin dashboard.
 */
export async function getAllStoreSettings(): Promise<AllStoreSettings> {
  const [shippingPolicy, banner, paymentInstructions] = await Promise.all([
    getShippingPolicySettings(),
    getBannerSettings(),
    getStoreSetting<PaymentInstructionsSettings>("payment_instructions", DEFAULT_PAYMENT_SETTINGS),
  ]);

  return {
    shippingPolicy,
    banner,
    paymentInstructions,
  };
}

export function resetMemorySettings(): void {
  MEMORY_STORE_SETTINGS.set("shipping_policy", DEFAULT_SHIPPING_SETTINGS);
  MEMORY_STORE_SETTINGS.set("announcement_banner", DEFAULT_BANNER_SETTINGS);
  MEMORY_STORE_SETTINGS.set("payment_instructions", DEFAULT_PAYMENT_SETTINGS);
}
