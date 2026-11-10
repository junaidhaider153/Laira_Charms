import { redirect } from "next/navigation";
import { getCurrentProfile, type UserProfile } from "./rbac";
import { isLiveSupabaseConfigured, allowOfflineFallback } from "./offline-mode";
import { SAMPLE_CUSTOMER_USER_ID } from "@/lib/account/address-service";

export const DEV_ADMIN_PROFILE: UserProfile = {
  id: "admin-dev-fallback",
  email: "admin@lairacharms.pk",
  display_name: "Studio Admin",
  phone: null,
  role: "admin",
};

/**
 * Route guard enforcing admin privileges.
 * - Live mode: requires authenticated user with profiles.role === 'admin'.
 * - Production with placeholder keys: fails closed and redirects to /login.
 * - Local development: allows fallback admin profile for offline workflow.
 */
export async function guardAdmin(returnTo: string): Promise<UserProfile> {
  if (isLiveSupabaseConfigured()) {
    let profile: UserProfile | null = null;
    try {
      profile = await getCurrentProfile();
    } catch {
      profile = null;
    }

    if (!profile) {
      redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }

    if (profile.role !== "admin") {
      redirect("/");
    }

    return profile;
  }

  // Not live: check whether offline dev fallback is permitted
  if (!allowOfflineFallback()) {
    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return DEV_ADMIN_PROFILE;
}

/**
 * Route guard enforcing customer authentication for /account/* pages.
 * - Live mode: requires authenticated user.
 * - Production with placeholder keys: fails closed and redirects to /login.
 * - Local development: returns sample customer user id for offline workflow.
 */
export async function guardCustomer(returnTo: string): Promise<string> {
  if (isLiveSupabaseConfigured()) {
    let profile: UserProfile | null = null;
    try {
      profile = await getCurrentProfile();
    } catch {
      profile = null;
    }

    if (!profile) {
      redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    }

    return profile.id;
  }

  // Not live: check whether offline dev fallback is permitted
  if (!allowOfflineFallback()) {
    redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return SAMPLE_CUSTOMER_USER_ID;
}

