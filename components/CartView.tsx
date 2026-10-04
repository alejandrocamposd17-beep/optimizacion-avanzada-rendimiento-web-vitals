"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/format";

const IVA = 0.13;

export function CartView() {
  const { lines, ready, subtotal, setQuantity, remove } = useCart();

  if (!ready) return <div className="skeleton h-48 rounded-2xl" />;

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8">
        <p className="text-lg font-semibold">Tu carrito está vacío.</p>
        <Link href="/" className="mt-4 inline-block rounded-lg bg-anil px-5 py-2.5 font-semibold text-white">Ver catálogo</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <ul className="flex flex-col divide-y divide-anil/10 rounded-2xl bg-white">
        {lines.map((l) => (
          <li key={l.productId} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <Link href={`/productos/${l.productId}`} className="font-bold hover:underline">{l.name}</Link>
              <p className="text-sm text-gris">{formatMoney(l.price)} c/u</p>
            </div>
            <div className="flex items-center gap-1" role="group" aria-label={`Cantidad de ${l.name}`}>
              <button
                onClick={() => setQuantity(l.productId, l.quantity - 1)}
                className="h-9 w-9 rounded-lg bg-niebla font-bold"
                aria-label="Quitar una unidad"
              >−</button>
              <span className="w-10 text-center font-semibold" aria-live="polite">{l.quantity}</span>
              <button
                onClick={() => setQuantity(l.productId, l.quantity + 1)}
                disabled={l.quantity >= l.stock}
                className="h-9 w-9 rounded-lg bg-niebla font-bold disabled:opacity-40"
                aria-label="Agregar una unidad"
              >+</button>
            </div>
            <span className="w-24 text-right font-bold">{formatMoney(l.price * l.quantity)}</span>
            <button onClick={() => remove(l.productId)} className="text-sm font-semibold text-error hover:underline">
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <aside className="flex h-fit flex-col gap-3 rounded-2xl bg-white p-5">
        <h2 className="text-lg font-bold">Resumen</h2>
        <dl className="flex flex-col gap-1">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div>
          <div className="flex justify-between text-gris"><dt>IVA 13 % (estimado)</dt><dd>{formatMoney(subtotal * IVA)}</dd></div>
          <div className="flex justify-between border-t border-anil/10 pt-2 text-lg font-extrabold">
            <dt>Total</dt><dd>{formatMoney(subtotal * (1 + IVA))}</dd>
          </div>
        </dl>
        <p className="text-sm text-gris">El total final lo calcula la API al crear la orden.</p>
        <Link href="/checkout" className="rounded-lg bg-anil px-5 py-3 text-center font-semibold text-white hover:bg-anil-deep">
          Ir a pagar
        </Link>
      </aside>
    </div>
  );
}
