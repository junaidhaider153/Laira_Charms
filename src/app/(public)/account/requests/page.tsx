import React from "react";
import { Metadata } from "next";
import { listCustomerCustomRequests } from "@/lib/custom-order/custom-order-service";
import { CustomerRequestsHistory } from "@/components/account/CustomerRequestsHistory";
import { guardCustomer } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bespoke Requests | My Account - Laira Charms",
  description: "Track your bespoke charm inquiries, review studio quotes, and discuss design briefs.",
};

export default async function CustomerRequestsPage() {
  const userId = await guardCustomer("/account/requests");
  const requests = await listCustomerCustomRequests(userId);

  return (
    <div className="py-2">
      <CustomerRequestsHistory requests={requests} />
    </div>
  );
}

