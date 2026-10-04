import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ApiError, getOrder } from "@/lib/api";
import { getToken } from "@/lib/session";
import { OrderSummary } from "@/components/OrderSummary";
import { RetryPaymentForm } from "@/components/RetryPaymentForm";
import { ReorderButton } from "@/components/ReorderButton";

export const metadata = { title: "Detalle de compra" };

export default async function OrderDetailPage({ params }: PageProps<"/historial/[id]">) {
  const { id } = await params;
  const token = await getToken();
  if (!token) redirect(`/login?next=/historial/${id}`);

  let order;
  try {
    order = await getOrder(token, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link href="/historial" className="font-semibold text-anil hover:underline">Volver a mis compras</Link>
      <OrderSummary order={order} />
      {order.status === "pending" && <RetryPaymentForm orderId={order.id} />}
      {order.status === "failed" && <ReorderButton items={order.items} />}
    </div>
  );
}
