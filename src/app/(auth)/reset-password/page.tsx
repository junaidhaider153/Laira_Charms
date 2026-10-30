"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/auth/auth-actions";

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);

  return (
    <div>
      <h2 className="text-2xl font-headline font-bold text-espresso-deep text-center mb-2">
        Create New Password
      </h2>
      <p className="text-xs text-espresso-muted text-center mb-6">
        Please enter and confirm your new secure account password
      </p>

      {state?.message && !state.success && (
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
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-espresso-muted mb-1"
          >
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-surface-cloud border border-border-warm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
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
            className="block text-xs font-semibold uppercase tracking-wider text-espresso-muted mb-1"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="w-full px-4 py-2.5 rounded-2xl bg-surface-cloud border border-border-warm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            placeholder="Re-enter your new password"
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
          className="w-full mt-2 py-3 px-4 rounded-full bg-primary text-white font-bold text-sm hover:bg-opacity-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Updating Password...
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-espresso-muted">
        Remembered previous password?{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}

