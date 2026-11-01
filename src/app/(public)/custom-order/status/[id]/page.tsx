import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  getCustomRequestById,
  MEMORY_QUOTATIONS,
} from "@/lib/custom-order/custom-order-service";

interface StatusPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export const metadata = {
  title: "Bespoke Commission Status • Laira Charms",
  description: "Track the real-time status of your handmade custom charm inquiry.",
};

export default async function CustomRequestStatusPage({
  params,
  searchParams,
}: StatusPageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  const request = await getCustomRequestById(id, token, null, true);
  if (!request) {
    notFound();
  }

  // Find quotation for this request if issued
  const quotes = Array.from(MEMORY_QUOTATIONS.values()).filter(
    (q) => q.requestId === request.id
  );
  const activeQuote = quotes[quotes.length - 1];

  const statusSteps = [
    { key: "submitted", label: "Inquiry Submitted", desc: "Received at Lahore studio" },
    { key: "under_review", label: "Studio Review", desc: "Feasibility & clay palette check" },
    { key: "quote_issued", label: "Quote Issued", desc: "Itemized quote available for review" },
    { key: "accepted", label: "Commission Confirmed", desc: "Oven curing, sculpting & glazing" },
  ];

  const currentStepIdx = statusSteps.findIndex((s) => s.key === request.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <Breadcrumbs
        items={[
          { label: "Custom Atelier", href: "/custom-order" },
          { label: "Commission Status" },
        ]}
      />

      <div className="bg-surface-cloud p-8 sm:p-12 rounded-3xl border border-border-warm/60 shadow-sm space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-warm pb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-strawberry-blush-dark block">
              Commission Reference #{request.id.slice(0, 8).toUpperCase()}
            </span>
            <h1 className="font-headline text-2xl sm:text-3xl font-bold text-espresso-deep mt-1">
              {request.title}
            </h1>
          </div>

          <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-matcha-tint text-matcha-soft border border-matcha-soft/20">
            {request.status.replace("_", " ")}
          </span>
        </div>

        {/* Status Timeline Rail */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {statusSteps.map((step, idx) => {
            const isCompleted = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;

            return (
              <div
                key={step.key}
                className={`p-4 rounded-3xl border transition-all shadow-xs ${
                  isCurrent
                    ? "bg-strawberry-subtle/40 border-strawberry-blush ring-2 ring-strawberry-blush/20"
                    : isCompleted
                    ? "bg-surface-custard border-border-warm"
                    : "bg-surface-cloud/40 border-border-warm/60 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? "bg-strawberry-blush text-on-primary" : "bg-border-warm text-espresso-muted"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </span>
                  <span className="font-headline font-bold text-xs text-espresso-deep">
                    {step.label}
                  </span>
                </div>
                <p className="text-[11px] text-espresso-muted leading-tight">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* If Quote is Issued, Show Direct Action Card */}
        {activeQuote && request.status === "quote_issued" && (
          <div className="p-6 rounded-3xl bg-peach-tint border border-strawberry-blush/20 text-center space-y-3 shadow-xs">
            <span className="text-2xl block">🎉</span>
            <h3 className="font-headline font-bold text-lg text-espresso-deep">
              A Formal Quotation is Ready for Your Approval!
            </h3>
            <p className="text-xs text-espresso-muted max-w-lg mx-auto">
              Our studio has reviewed your brief and issued an itemized quotation valid for 7 days.
            </p>
            <div>
              <Link
                href={`/custom-order/quotes/${activeQuote.id}${token ? `?token=${encodeURIComponent(token)}` : ""}`}
                className="inline-block py-3 px-8 rounded-full bg-strawberry-blush hover:opacity-95 text-on-primary font-bold text-xs shadow-xs transition-all active:scale-95"
              >
                Review &amp; Accept Quotation →
              </Link>
            </div>
          </div>
        )}

        {/* Brief Reference */}
        <div className="space-y-2 text-xs border-t border-border-warm/60 pt-6">
          <span className="font-headline font-bold text-espresso-deep block uppercase tracking-wider">
            Commission Specifications
          </span>
          <p className="text-espresso-muted leading-relaxed whitespace-pre-line bg-surface-custard p-4 rounded-2xl border border-border-warm">
            {request.brief}
          </p>
        </div>
      </div>
    </div>
  );
}

