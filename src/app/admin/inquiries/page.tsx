import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { listAllCustomRequests } from "@/lib/custom-order/custom-order-service";
import { guardAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bespoke Inquiries | Admin Portal - Laira Charms",
  description: "Review incoming custom keepsake requests, issue quotations, and discuss commissions.",
};

export default async function AdminInquiriesPage() {
  await guardAdmin("/admin/inquiries");
  const { requests, quotations } = await listAllCustomRequests();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="font-headline font-bold text-3xl text-espresso-deep">
          Bespoke Commission Inquiries
        </h1>
        <p className="text-xs sm:text-sm text-espresso-muted mt-1">
          Review customer design briefs, evaluate sculpting feasibility, and draft formal studio quotations.
        </p>
      </div>

      <div className="rounded-3xl bg-surface-cloud border border-border-warm/60 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs text-espresso-deep">
          <thead className="bg-surface-custard/60 border-b border-border-warm text-espresso-muted uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Commission Title</th>
              <th className="py-3.5 px-4">Customer Contact</th>
              <th className="py-3.5 px-4">Target Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Quotation</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-warm/60">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-espresso-muted">
                  No bespoke inquiries currently in queue.
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const quote = quotations.find((q) => q.requestId === req.id) || null;

                return (
                  <tr key={req.id} className="hover:bg-surface-cloud/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-sm block">{req.title}</span>
                      <p className="text-[11px] text-espresso-muted line-clamp-1 mt-0.5">{req.brief}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-espresso-deep">{req.guestEmail || "Registered Customer"}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {req.desiredDeliveryDate ? (
                        <span className="font-medium text-espresso-deep">
                          {new Date(req.desiredDeliveryDate).toLocaleDateString("en-PK", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-espresso-muted">Flexible</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.status === "quote_issued"
                            ? "bg-secondary/15 text-secondary border border-secondary/30"
                            : req.status === "accepted"
                            ? "bg-secondary text-white"
                            : "bg-peach-tint text-primary border border-primary/25"
                        }`}
                      >
                        {req.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {quote ? (
                        <span className="font-bold text-espresso-deep">
                          Rs. {(quote.amountMinor / 100).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-espresso-muted italic">Pending quote</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                      <Link
                        href={`/custom-order/status/${req.id}`}
                        className="inline-flex items-center px-4 py-1.5 rounded-full bg-surface-custard border border-border-warm text-espresso-deep font-bold text-xs hover:bg-surface-container transition-all active:scale-95"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

