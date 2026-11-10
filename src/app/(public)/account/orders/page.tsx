import React from "react";
import { Metadata } from "next";
import { listCustomerOrders } from "@/lib/checkout/order-service";
import { CustomerOrderHistory } from "@/components/account/CustomerOrderHistory";
import { guardCustomer } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order History | My Account - Laira Charms",
  description: "Review all handcrafted keepsake commissions, payments, and tracking timelines.",
};

export default async function CustomerOrdersPage() {
  const userId = await guardCustomer("/account/orders");
  const orders = await listCustomerOrders(userId);

  return (
    <div className="py-2">
      <CustomerOrderHistory orders={orders} />
    </div>
  );
}

