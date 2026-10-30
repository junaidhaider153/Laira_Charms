import { FIXTURE_OPTION_GROUPS } from "./fixtures";
import type { OptionGroup } from "./types";

interface DbOptionValueRow {
  id: string;
  group_id: string;
  label: string;
  price_delta_minor: number;
  is_available: boolean;
  sort_order: number;
}

interface DbOptionGroupRow {
  id: string;
  product_id: string;
  name: string;
  is_required: boolean;
  sort_order: number;
  option_values: DbOptionValueRow[];
}

function isLiveSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes("dummy-project") || url.includes("example.com")) {
    return false;
  }
  return true;
}

/**
 * Retrieves option groups configured for a product from database or fixtures.
 * Server-only function.
 */
export async function getOptionGroupsForProduct(productId: string): Promise<OptionGroup[]> {
  if (isLiveSupabaseConfigured()) {
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const supabase = await createServerSupabaseClient();

      const { data: groups, error: grpError } = await supabase
        .from("option_groups")
        .select(`
          id,
          product_id,
          name,
          is_required,
          sort_order,
          option_values (
            id,
            group_id,
            label,
            price_delta_minor,
            is_available,
            sort_order
          )
        `)
        .eq("product_id", productId)
        .order("sort_order", { ascending: true });

      if (!grpError && groups && groups.length > 0) {
        const rows = groups as unknown as DbOptionGroupRow[];
        return rows.map((grp) => ({
          id: grp.id,
          productId: grp.product_id,
          name: grp.name,
          type: "single_choice" as const,
          isRequired: grp.is_required,
          sortOrder: grp.sort_order,
          values: (grp.option_values || [])
            .filter((v) => v.is_available)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((v) => ({
              id: v.id,
              groupId: v.group_id,
              label: v.label,
              priceDeltaMinor: Number(v.price_delta_minor || 0),
              isAvailable: v.is_available,
              sortOrder: v.sort_order,
            })),
        }));
      }
    } catch {
      // Graceful fallback to verified fixtures
    }
  }

  return FIXTURE_OPTION_GROUPS[productId] || [];
}

