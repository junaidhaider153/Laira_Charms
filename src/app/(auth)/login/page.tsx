"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signInAction } from "@/lib/auth/auth-actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const authCodeError = searchParams.get("error") === "auth-code-error";
  const returnTo = searchParams.get("returnTo") || "";

  const [state, formAction, isPending] = useActionState(signInAction, null);

  return (
    <div>
      <h2 className="text-2xl font-headline font-bold text-espresso-deep text-center mb-2">
        Welcome Back
      </h2>
      <p className="text-xs text-espresso-muted text-center mb-6">
        Sign in to manage your handmade charm orders and messages
      </p>

      {resetSuccess && (
        <div
          role="status"
          className="mb-4 p-3.5 bg-matcha-tint border border-matcha-soft/30 text-matcha-soft text-xs font-semibold rounded-2xl"
        >
          ✓ Your password has been successfully reset. Please sign in with your new credentials.
        </div>
      )}

      {authCodeError && (
        <div
          role="alert"
          className="mb-4 p-3.5 bg-error-container text-error text-xs font-semibold rounded-2xl border border-error/20"
        >
          The verification link may have expired or is invalid. Please try requesting a new link.
        </div>
      )}

      {state?.message && !state.success && (
        <div
          role="alert"
          className="mb-4 p-3.5 bg-error-container text-error text-xs font-semibold rounded-2xl border border-error/20"
        >
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="returnTo" value={returnTo} />

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold text-espresso-deep mb-1"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-canvas-butter border border-border-warm text-espresso-deep placeholder:text-espresso-muted/50 focus:outline-none focus:ring-2 focus:ring-strawberry-blush focus:border-transparent text-xs transition-all"
            placeholder="collector@example.pk"
          />
          {state?.fieldErrors?.email && (
            <p className="mt-1 text-xs text-error font-medium">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="text-xs font-bold text-espresso-deep"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-canvas-butter border border-border-warm text-espresso-deep placeholder:text-espresso-muted/50 focus:outline-none focus:ring-2 focus:ring-strawberry-blush focus:border-transparent text-xs transition-all"
            placeholder="••••••••"
          />
          {state?.fieldErrors?.password && (
            <p className="mt-1 text-xs text-error font-medium">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-5 rounded-full bg-strawberry-blush text-on-primary font-bold text-xs hover:opacity-95 transition-all shadow-xs disabled:opacity-50 active:scale-95 cursor-pointer mt-2"
        >
          {isPending ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-border-warm/60 text-center">
        <p className="text-xs text-espresso-muted">
          Don&apos;t have an atelier account yet?{" "}
          <Link
            href="/register"
            className="font-bold text-primary hover:underline ml-1"
          >
            Create one now &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-espresso-muted">
          Loading sign in...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
