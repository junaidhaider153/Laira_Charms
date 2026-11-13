"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction } from "@/lib/auth/auth-actions";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signUpAction, null);

  return (
    <div>
      <h2 className="text-2xl font-headline font-bold text-espresso-deep text-center mb-2">
        Create Your Account
      </h2>
      <p className="text-xs text-espresso-muted text-center mb-6">
        Join our artisan community to order personalized charms and track bespoke requests
      </p>

      {state?.message && !state.success && (
        <div
          role="alert"
          className="mb-4 p-3.5 bg-error-container text-error text-xs font-semibold rounded-2xl border border-error/20"
        >
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Honeypot field for bot spam prevention */}
        <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
          <label htmlFor="auth_hp">Company</label>
          <input
            id="auth_hp"
            name="auth_hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div>
          <label
            htmlFor="displayName"
            className="block text-xs font-bold text-espresso-deep mb-1"
          >
            Full Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-canvas-butter border border-border-warm text-espresso-deep placeholder:text-espresso-muted/50 focus:outline-none focus:ring-2 focus:ring-strawberry-blush focus:border-transparent text-xs transition-all"
            placeholder="Ayesha Khan"
          />
          {state?.fieldErrors?.displayName && (
            <p className="mt-1 text-xs text-error font-medium">
              {state.fieldErrors.displayName[0]}
            </p>
          )}
        </div>

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
            placeholder="ayesha@example.pk"
          />
          {state?.fieldErrors?.email && (
            <p className="mt-1 text-xs text-error font-medium">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-xs font-bold text-espresso-deep mb-1"
          >
            Mobile Number (Optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="w-full px-4 py-2.5 rounded-2xl bg-canvas-butter border border-border-warm text-espresso-deep placeholder:text-espresso-muted/50 focus:outline-none focus:ring-2 focus:ring-strawberry-blush focus:border-transparent text-xs transition-all"
            placeholder="0300-1234567"
          />
          {state?.fieldErrors?.phone && (
            <p className="mt-1 text-xs text-error font-medium">
              {state.fieldErrors.phone[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold text-espresso-deep mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-canvas-butter border border-border-warm text-espresso-deep placeholder:text-espresso-muted/50 focus:outline-none focus:ring-2 focus:ring-strawberry-blush focus:border-transparent text-xs transition-all"
            placeholder="Min. 8 characters with numbers & uppercase"
          />
          {state?.fieldErrors?.password && (
            <p className="mt-1 text-xs text-error font-medium">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-bold text-espresso-deep mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-canvas-butter border border-border-warm text-espresso-deep placeholder:text-espresso-muted/50 focus:outline-none focus:ring-2 focus:ring-strawberry-blush focus:border-transparent text-xs transition-all"
            placeholder="Re-enter your password"
          />
          {state?.fieldErrors?.confirmPassword && (
            <p className="mt-1 text-xs text-error font-medium">
              {state.fieldErrors.confirmPassword[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-3 px-5 rounded-full bg-strawberry-blush text-on-primary font-bold text-xs hover:opacity-95 transition-all shadow-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-espresso-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-strawberry-blush-dark hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

