import React from "react";
import { Metadata } from "next";
import { listCustomerOrders } from "@/lib/checkout/order-service";
import { CustomerOrderHistory } from "@/components/account/CustomerOrderHistory";
import { SAMPLE_CUSTOMER_USER_ID } from "@/lib/account/address-service";

export const metadata: Metadata = {
  title: "Order History | My Account - Laira Charms",
  description: "Review all handcrafted keepsake commissions, payments, and tracking timelines.",
};

export default async function CustomerOrdersPage() {
  const userId = SAMPLE_CUSTOMER_USER_ID;
  const orders = await listCustomerOrders(userId);

  return (
    <div className="py-2">
      <CustomerOrderHistory orders={orders} />
    </div>
  );
}

