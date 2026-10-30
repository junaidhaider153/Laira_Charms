import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CustomOrderForm } from "@/components/custom-order/CustomOrderForm";

export const metadata = {
  title: "Request Bespoke Charm Commission • Laira Charms Pakistan",
  description: "Commission an exclusive one-of-a-kind polymer clay miniature pet portrait, bridal keepsake, or original character keychain.",
};

interface CustomOrderPageProps {
  searchParams: Promise<{
    ref?: string;
  }>;
}

export default async function CustomOrderPage({ searchParams }: CustomOrderPageProps) {
  const { ref } = await searchParams;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <Breadcrumbs items={[{ label: "Custom Atelier" }]} />

      {/* Header Banner */}
      <div className="bg-surface-custard p-8 sm:p-12 rounded-3xl border border-border-warm shadow-xs text-center space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-primary block">
          Bespoke Atelier Commission
        </span>
        <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-espresso-deep leading-tight">
          Handcrafted Miniature Art, Sculpted to Your Vision
        </h1>
        <p className="text-sm text-espresso-muted max-w-2xl mx-auto leading-relaxed">
          From custom pet portraits to whimsical miniature replicas, our Lahore studio sculpts every commission from premium polymer clay, oven-cured and sealed with a triple UV diamond glaze.
        </p>

        {/* 3 Core Studio Promises */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs font-bold text-espresso-deep text-left max-w-2xl mx-auto">
          <div className="p-3 rounded-2xl bg-surface-cloud border border-border-warm flex items-center gap-2.5">
            <span className="text-lg">🎨</span>
            <span>Hand-Sculpted from Reference Photos</span>
          </div>
          <div className="p-3 rounded-2xl bg-surface-cloud border border-border-warm flex items-center gap-2.5">
            <span className="text-lg">⏱️</span>
            <span>24h Quote &amp; Feasibility Review</span>
          </div>
          <div className="p-3 rounded-2xl bg-surface-cloud border border-border-warm flex items-center gap-2.5">
            <span className="text-lg">📦</span>
            <span>Boutique Gift Box Presentation</span>
          </div>
        </div>
      </div>

      {/* Inquiry Form */}
      <CustomOrderForm initialProductRef={ref} />
    </div>
  );
}
