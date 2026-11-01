import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas-butter flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft Ambient Boutique Backdrop Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-strawberry-subtle/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-peach-tint/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-13 h-13 rounded-3xl bg-peach-tint border border-strawberry-blush/20 flex items-center justify-center text-strawberry-blush text-2xl font-bold shadow-xs group-hover:scale-105 transition-transform">
            ✨
          </div>
          <div className="text-left">
            <span className="font-headline font-bold text-2xl text-espresso-deep block leading-tight">
              Laira Charms
            </span>
            <span className="text-[11px] font-bold text-strawberry-blush-dark tracking-wider uppercase block">
              Handcrafted Keepsakes
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface-cloud py-8 px-6 shadow-sm border border-border-warm/60 rounded-3xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}

