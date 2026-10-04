import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiError, getOrders } from "@/lib/api";
import { getToken } from "@/lib/session";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderListSkeleton } from "@/components/Skeletons";

export const metadata = { title: "Mis compras" };

export default async function HistoryPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/historial");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Mis compras</h1>
      {/* Suspense: el historial se transmite por streaming mientras el título ya es visible */}
      <Suspense fallback={<OrderListSkeleton />}>
        <OrderList token={token} />
      </Suspense>
    </div>
  );
}

async function OrderList({ token }: { token: string }) {
  let orders;
  try {
    orders = await getOrders(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login?next=/historial&expired=1");
    throw error;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8">
        <p className="text-lg font-semibold">Todavía no tienes compras.</p>
        <Link href="/" className="mt-4 inline-block rounded-lg bg-anil px-5 py-2.5 font-semibold text-white">Ver catálogo</Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/historial/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 hover:ring-2 hover:ring-anil/30">
            <div>
              <p className="font-bold">Orden {o.orderNumber}</p>
              <p className="text-sm text-gris">{formatDate(o.createdAt)}{o.items.length ? `, ${o.items.length} productos` : ""}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-extrabold">{formatMoney(o.total)}</span>
              <StatusBadge status={o.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
