"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/auth/auth-actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, null);

  return (
    <div>
      <h2 className="text-2xl font-headline font-bold text-espresso-deep text-center mb-2">
        Reset Your Password
      </h2>
      <p className="text-xs text-espresso-muted text-center mb-6">
        Enter your registered email address and we will send you a recovery link
      </p>

      {state?.success ? (
        <div className="space-y-4">
          <div
            role="status"
            className="p-4 bg-matcha-tint border border-secondary/20 text-secondary text-sm rounded-2xl leading-relaxed"
          >
            {state.message}
          </div>
          <Link
            href="/login"
            className="block text-center w-full py-3 px-4 rounded-full bg-surface-custard text-espresso-deep font-bold text-sm hover:bg-surface-container transition-all"
          >
            Return to Login
          </Link>
        </div>
      ) : (
        <>
          {state?.message && (
            <div
              role="alert"
              className="mb-4 p-3 bg-error-container text-error text-sm rounded-2xl"
            >
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-espresso-muted mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-cloud border border-border-warm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                placeholder="you@example.com"
              />
              {state?.fieldErrors?.email && (
                <p className="mt-1 text-xs text-error font-medium">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 px-4 rounded-full bg-primary text-white font-bold text-sm hover:bg-opacity-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Sending Recovery Link...
                </>
              ) : (
                "Send Password Reset Link"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-espresso-muted">
            Remembered your password?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
