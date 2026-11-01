"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error securely
    console.error("Storefront Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-error-container text-error flex items-center justify-center mb-4 text-2xl font-bold">
        !
      </div>
      <h2 className="text-2xl font-headline font-bold text-espresso-deep mb-2">
        Something went slightly adrift
      </h2>
      <p className="text-body-md text-espresso-muted mb-6">
        We encountered an unexpected bump while baking your charms. Please try again or reach out to our team.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-full bg-strawberry-blush text-on-primary font-bold text-xs hover:opacity-95 transition-all shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-strawberry-blush focus:ring-offset-2"
        >
          Try Again
        </button>
        <a
          href="/"
          className="px-6 py-2.5 rounded-full bg-surface-custard border border-border-warm text-espresso-deep font-bold text-xs hover:bg-surface-container transition-all active:scale-95"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

