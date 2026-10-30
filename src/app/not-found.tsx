import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <div className="w-20 h-20 rounded-full bg-strawberry-subtle text-strawberry-blush flex items-center justify-center mb-6 text-3xl font-bold">
        🧸
      </div>
      <h1 className="text-3xl font-headline font-bold text-espresso-deep mb-2">
        Page Not Found (404)
      </h1>
      <p className="text-body-md text-espresso-muted mb-8">
        This keepsake seems to have wandered off the workshop shelf. Let&apos;s guide you back to our handmade collection.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-opacity-95 transition-all shadow-sm"
        >
          Explore Collection
        </Link>
        <Link
          href="/custom-order"
          className="px-6 py-3 rounded-full bg-surface-custard text-espresso-deep font-semibold hover:bg-surface-container transition-all"
        >
          Request Custom Charm
        </Link>
      </div>
    </div>
  );
}

