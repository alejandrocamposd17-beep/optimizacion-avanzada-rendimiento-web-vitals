import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ApiError, getOrder } from "@/lib/api";
import { getToken } from "@/lib/session";
import { OrderSummary } from "@/components/OrderSummary";
import { ClearCart } from "@/components/ClearCart";

export const metadata = { title: "Compra confirmada" };

export default async function ConfirmationPage({ params }: PageProps<"/checkout/confirmacion/[id]">) {
  const { id } = await params;
  const token = await getToken();
  if (!token) redirect(`/login?next=/checkout/confirmacion/${id}`);

  let order;
  try {
    order = await getOrder(token, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const paid = order.status === "paid";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {paid && <ClearCart orderId={order.id} />}
      <div className={`rounded-3xl p-8 text-white ${paid ? "bg-anil" : "bg-tinta"}`}>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {paid ? "Pago aprobado, gracias por tu compra" : "Tu orden aún no está pagada"}
        </h1>
        <p className="mt-2 text-white/85">
          {paid
            ? "Stripe confirmó el cobro y la orden quedó registrada en tu historial."
            : "Puedes reintentar el pago desde el detalle de la orden."}
        </p>
      </div>
      <OrderSummary order={order} />
      <div className="flex flex-wrap gap-3">
        <Link href="/historial" className="rounded-lg bg-anil px-5 py-2.5 font-semibold text-white">Ver mis compras</Link>
        <Link href="/" className="rounded-lg bg-white px-5 py-2.5 font-semibold text-anil">Seguir comprando</Link>
      </div>
    </div>
  );
}
