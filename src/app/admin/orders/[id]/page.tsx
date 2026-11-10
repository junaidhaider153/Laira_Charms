import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/order/order-admin-service";
import { AdminOrderDetailView } from "@/components/admin/AdminOrderDetailView";
import { guardAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminOrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order ${id} | Admin Portal - Laira Charms`,
    description: `Administrative inspection and status management for order ${id}.`,
  };
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  await guardAdmin(`/admin/orders/${id}`);
  const result = await getAdminOrderById(id);

  if (!result) {
    notFound();
  }

  return (
    <div className="py-2">
      <AdminOrderDetailView
        order={result.order}
        history={result.history}
        payment={result.payment}
      />
    </div>
  );
}

