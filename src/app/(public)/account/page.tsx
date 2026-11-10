import React from "react";
import Link from "next/link";
import { listAddresses } from "@/lib/account/address-service";
import { listCustomerOrders } from "@/lib/checkout/order-service";
import { listCustomerCustomRequests } from "@/lib/custom-order/custom-order-service";
import { formatMoney } from "@/lib/utils";
import { formatOrderStatus } from "@/lib/order/lifecycle";
import { guardCustomer } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AccountOverviewPage() {
  const userId = await guardCustomer("/account");
  const addresses = await listAddresses(userId);
  const orders = await listCustomerOrders(userId);
  const requests = await listCustomerCustomRequests(userId);

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const recentOrder = orders[0];
  const recentRequest = requests[0];

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-surface-cloud border border-border-warm/60 shadow-xs">
          <span className="text-2xl mb-1 block">🛍️</span>
          <span className="text-xs text-espresso-muted block font-medium">Total Orders Placed</span>
          <span className="font-headline font-bold text-2xl text-espresso-deep mt-1 block">
            {orders.length}
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-surface-cloud border border-border-warm/60 shadow-xs">
          <span className="text-2xl mb-1 block">🎨</span>
          <span className="text-xs text-espresso-muted block font-medium">Bespoke Inquiries</span>
          <span className="font-headline font-bold text-2xl text-espresso-deep mt-1 block">
            {requests.length}
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-surface-cloud border border-border-warm/60 shadow-xs">
          <span className="text-2xl mb-1 block">🏡</span>
          <span className="text-xs text-espresso-muted block font-medium">Saved Addresses</span>
          <span className="font-headline font-bold text-2xl text-espresso-deep mt-1 block">
            {addresses.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Default Shipping Address Card */}
        <div className="p-6 rounded-3xl bg-surface-cloud border border-border-warm/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border-warm pb-3">
            <h2 className="font-headline font-bold text-base text-espresso-deep flex items-center gap-2">
              <span>🏡</span> Default Delivery Destination
            </h2>
            <Link
              href="/account/addresses"
              className="text-xs font-bold text-strawberry-blush-dark hover:underline"
            >
              Manage &rarr;
            </Link>
          </div>

          {defaultAddress ? (
            <div className="text-xs text-espresso-deep space-y-1 leading-relaxed">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{defaultAddress.recipientName}</span>
                <span className="px-2 py-0.5 rounded-full bg-strawberry-blush text-on-primary text-[10px] font-bold uppercase">
                  Default
                </span>
              </div>
              <p className="font-mono text-espresso-muted">{defaultAddress.phone}</p>
              <p>{defaultAddress.addressLine1}</p>
              {defaultAddress.addressLine2 && <p>{defaultAddress.addressLine2}</p>}
              <p>
                {defaultAddress.city}, {defaultAddress.province} {defaultAddress.postalCode ? `- ${defaultAddress.postalCode}` : ""}
              </p>
              {defaultAddress.deliveryNotes && (
                <p className="text-[11px] text-espresso-muted italic pt-1">
                  &ldquo;{defaultAddress.deliveryNotes}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <div className="text-xs text-espresso-muted">
              No address saved yet.{" "}
              <Link href="/account/addresses" className="font-bold text-strawberry-blush-dark underline">
                Add an address
              </Link>
            </div>
          )}
        </div>

        {/* Most Recent Order Card */}
        <div className="p-6 rounded-3xl bg-surface-cloud border border-border-warm/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border-warm pb-3">
            <h2 className="font-headline font-bold text-base text-espresso-deep flex items-center gap-2">
              <span>📦</span> Most Recent Order
            </h2>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-strawberry-blush-dark hover:underline"
            >
              All Orders &rarr;
            </Link>
          </div>

          {recentOrder ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-strawberry-blush-dark text-sm">
                  {recentOrder.reference}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    formatOrderStatus(recentOrder.orderStatus).badgeClass
                  }`}
                >
                  {formatOrderStatus(recentOrder.orderStatus).label}
                </span>
              </div>

              <div className="text-xs text-espresso-muted flex justify-between items-center">
                <span>Total: <strong className="text-espresso-deep font-bold">{formatMoney(recentOrder.totalMinor)}</strong></span>
                <span>{recentOrder.items.length} {recentOrder.items.length === 1 ? "charm" : "charms"}</span>
              </div>

              <div className="pt-2 border-t border-border-warm/50 flex justify-end">
                <Link
                  href={`/orders/${recentOrder.reference}`}
                  className="px-5 py-2 rounded-full bg-surface-custard border border-border-warm text-espresso-deep font-bold text-xs hover:bg-surface-container transition-all active:scale-95"
                >
                  View Details &amp; Track &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-xs text-espresso-muted">
              No orders placed yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Bespoke Inquiry */}
      {recentRequest && (
        <div className="p-6 rounded-3xl bg-surface-cloud border border-border-warm/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border-warm pb-3">
            <h2 className="font-headline font-bold text-base text-espresso-deep flex items-center gap-2">
              <span>🎨</span> Latest Bespoke Commission Request
            </h2>
            <Link
              href="/account/requests"
              className="text-xs font-bold text-strawberry-blush-dark hover:underline"
            >
              All Inquiries &rarr;
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-base text-espresso-deep">
                  {recentRequest.title}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-peach-tint text-strawberry-blush-dark border border-strawberry-blush/20 text-[10px] font-bold uppercase">
                  {recentRequest.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-espresso-muted line-clamp-1 mt-1">{recentRequest.brief}</p>
            </div>

            <Link
              href={`/custom-order/status/${recentRequest.id}`}
              className="px-5 py-2 rounded-full bg-surface-custard border border-border-warm text-espresso-deep font-bold text-xs hover:bg-surface-container transition-all shrink-0 active:scale-95"
            >
              View Status &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

