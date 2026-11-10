/**
 * Offline and local development mode detection.
 * Dev/offline mode must work with `npm run dev` and local tests,
 * but must NEVER apply in a production build or when Supabase is live.
 */

export function isLiveSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(url && !url.includes("dummy-project") && !url.includes("example.com"));
}

export function allowOfflineFallback(): boolean {
  return !isLiveSupabaseConfigured() && process.env.NODE_ENV !== "production";
}

