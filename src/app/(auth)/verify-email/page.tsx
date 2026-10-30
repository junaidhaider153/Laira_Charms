"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email address";

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-strawberry-subtle text-strawberry-blush mx-auto flex items-center justify-center text-3xl mb-4">
        💌
      </div>

      <h2 className="text-2xl font-headline font-bold text-espresso-deep mb-2">
        Check Your Inbox
      </h2>

      <p className="text-sm text-espresso-muted mb-4 leading-relaxed">
        We have dispatched a verification link to:
      </p>

      <div className="p-3 bg-surface-cloud border border-border-warm rounded-2xl text-espresso-deep font-semibold text-sm mb-6 inline-block max-w-full truncate px-4">
        {email}
      </div>

      <p className="text-xs text-espresso-muted leading-relaxed mb-6">
        Click the link inside the email to activate your account and start ordering custom handmade keepsakes. If you do not see it within a couple of minutes, please check your spam or promotions folder.
      </p>

      <div className="space-y-3">
        <Link
          href="/login"
          className="block w-full py-3 px-4 rounded-full bg-primary text-white font-bold text-sm hover:bg-opacity-95 transition-all shadow-sm"
        >
          Proceed to Sign In
        </Link>
        <Link
          href="/"
          className="block w-full py-3 px-4 rounded-full bg-surface-custard text-espresso-deep font-semibold text-sm hover:bg-surface-container transition-all"
        >
          Return to Storefront
        </Link>
      </div>
    </div>
  );
}
