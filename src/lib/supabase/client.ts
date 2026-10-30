import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Creates a browser-side Supabase client using public credentials.
 * Safe for client components and browser execution.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
