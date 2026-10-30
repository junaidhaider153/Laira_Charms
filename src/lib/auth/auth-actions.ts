"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth-validators";

export interface AuthActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Signs in a user with email and password.
 */
export async function signInAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
      message: "Please correct the highlighted errors.",
    };
  }

  const { email, password } = validation.data;
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      message: "Invalid email or password. Please try again.",
    };
  }

  const returnTo = formData.get("returnTo") as string;
  redirect(returnTo && returnTo.startsWith("/") ? returnTo : "/account");
}

/**
 * Registers a new customer account.
 */
export async function signUpAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validation = registerSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
      message: "Please correct the highlighted form errors.",
    };
  }

  const { displayName, email, phone, password } = validation.data;
  const headerStore = await headers();
  const origin = headerStore.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        display_name: displayName,
        phone: phone || null,
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to create account. Please try again.",
    };
  }

  redirect("/verify-email?email=" + encodeURIComponent(email));
}

/**
 * Requests a password reset link.
 * Implements AUTH-014: Generic confirmation to prevent user enumeration.
 */
export async function forgotPasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email"),
  };

  const validation = forgotPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
      message: "Please enter a valid email address.",
    };
  }

  const { email } = validation.data;
  const headerStore = await headers();
  const origin = headerStore.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const supabase = await createServerSupabaseClient();
  // Call Supabase resetPasswordForEmail
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  // Always return identical generic confirmation response (AUTH-014)
  return {
    success: true,
    message:
      "If an account is associated with that email, instructions to reset your password have been dispatched. Please check your inbox and spam folder.",
  };
}

/**
 * Resets user password with valid session or token.
 */
export async function resetPasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validation = resetPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
      message: "Please ensure your passwords match and meet security standards.",
    };
  }

  const { password } = validation.data;
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      success: false,
      message: error.message || "Unable to update password. Your reset link may have expired.",
    };
  }

  redirect("/login?reset=success");
}

/**
 * Signs the user out.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

