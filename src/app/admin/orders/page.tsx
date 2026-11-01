import { Metadata } from "next";
import { listAdminOrders } from "@/lib/order/order-admin-service";
import { AdminOrdersDashboard } from "@/components/admin/AdminOrdersDashboard";

export const metadata: Metadata = {
  title: "Orders Queue | Admin Portal - Laira Charms",
  description: "Administrative order fulfillment queue and status tracking.",
};

export default async function AdminOrdersPage() {
  const { orders, counts } = await listAdminOrders();

  return (
    <div className="py-2">
      <AdminOrdersDashboard initialOrders={orders} initialCounts={counts} />
    </div>
  );
}

