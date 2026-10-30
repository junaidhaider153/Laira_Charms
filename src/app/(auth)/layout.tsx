import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-custard flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-full bg-strawberry-subtle flex items-center justify-center text-strawberry-blush text-2xl font-bold shadow-sm group-hover:scale-105 transition-transform">
            ✨
          </div>
          <div className="text-left">
            <span className="font-headline font-bold text-2xl text-espresso-deep block leading-tight">
              Laira Charms
            </span>
            <span className="text-xs font-semibold text-espresso-muted tracking-wider uppercase block">
              Handcrafted Keepsakes
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-canvas-butter py-8 px-6 shadow-sm border border-border-warm rounded-3xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
