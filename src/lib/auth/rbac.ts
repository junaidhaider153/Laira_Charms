import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  role: UserRole;
}

/**
 * Retrieves the currently authenticated Supabase user.
 * Returns null if not logged in.
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Retrieves the profile and authorization role of the current user.
 */
export async function getCurrentProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createServerSupabaseClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, phone, role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // If profile row has not yet synchronized, fallback safely to default customer role
    return {
      id: user.id,
      email: user.email || "",
      display_name: user.user_metadata?.display_name || null,
      phone: user.user_metadata?.phone || null,
      role: "customer",
    };
  }

  return profile as unknown as UserProfile;
}

/**
 * Route guard enforcing authentication. Redirects to /login if unauthenticated.
 */
export async function requireAuth(redirectTo: string = "/login"): Promise<UserProfile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(redirectTo);
  }
  return profile;
}

/**
 * Route guard enforcing administrator privileges.
 * Redirects to /login if unauthenticated, or to / if unauthorized.
 */
export async function requireAdmin(unauthorizedRedirect: string = "/"): Promise<UserProfile> {
  const profile = await requireAuth();
  if (profile.role !== "admin") {
    redirect(unauthorizedRedirect);
  }
  return profile;
}

/**
 * Pure helper to verify admin role.
 */
export function isAdmin(profile: { role?: UserRole } | null | undefined): boolean {
  return profile?.role === "admin";
}
