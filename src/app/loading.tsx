export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center" role="status" aria-live="polite">
      <div className="w-12 h-12 rounded-full border-4 border-strawberry-subtle border-t-primary animate-spin mb-4" />
      <p className="text-label-lg font-semibold text-espresso-muted">Crafting charm experience...</p>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
}

