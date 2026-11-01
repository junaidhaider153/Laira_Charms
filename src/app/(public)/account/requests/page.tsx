import React from "react";
import { Metadata } from "next";
import { listCustomerCustomRequests } from "@/lib/custom-order/custom-order-service";
import { CustomerRequestsHistory } from "@/components/account/CustomerRequestsHistory";
import { SAMPLE_CUSTOMER_USER_ID } from "@/lib/account/address-service";

export const metadata: Metadata = {
  title: "Bespoke Requests | My Account - Laira Charms",
  description: "Track your bespoke charm inquiries, review studio quotes, and discuss design briefs.",
};

export default async function CustomerRequestsPage() {
  const userId = SAMPLE_CUSTOMER_USER_ID;
  const requests = await listCustomerCustomRequests(userId);

  return (
    <div className="py-2">
      <CustomerRequestsHistory requests={requests} />
    </div>
  );
}

