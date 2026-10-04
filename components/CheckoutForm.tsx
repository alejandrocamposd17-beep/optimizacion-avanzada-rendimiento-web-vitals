"use client";

import { useActionState } from "react";
import Link from "next/link";
import { checkoutAction } from "@/lib/actions";
import type { ActionState } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useCart } from "./CartProvider";
import { SubmitButton } from "./SubmitButton";

const testCards = [
  { value: "pm_card_visa", label: "Visa de prueba", hint: "Pago aprobado" },
  { value: "pm_card_mastercard", label: "Mastercard de prueba", hint: "Pago aprobado" },
  { value: "pm_card_chargeDeclined", label: "Tarjeta rechazada", hint: "Simula un rechazo (402)" },
  { value: "pm_card_insufficientFunds", label: "Fondos insuficientes", hint: "Simula un rechazo (402)" },
];

export function CheckoutForm({ defaultAddress }: { defaultAddress?: string }) {
  const { lines, ready, subtotal } = useCart();
  const [state, formAction] = useActionState(checkoutAction, {} as ActionState);

  // Errores de validación de la API sobre los productos (p. ej. "items.0.quantity")
  const otherErrors = Object.entries(state.fieldErrors ?? {})
    .filter(([key]) => key !== "shipping_address")
    .flatMap(([, messages]) => messages);

  if (!ready) return <div className="skeleton h-72 rounded-2xl" />;
  if (lines.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8">
        <p className="text-lg font-semibold">No hay productos para pagar.</p>
        <Link href="/" className="mt-4 inline-block rounded-lg bg-anil px-5 py-2.5 font-semibold text-white">Ver catálogo</Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <input type="hidden" name="cart" value={JSON.stringify(lines)} />

      <div className="flex flex-col gap-6 rounded-2xl bg-white p-6">
        {state.message && (
          <div role="alert" className="rounded-lg bg-error/10 p-4 text-error">
            <p>{state.message}</p>
            {otherErrors.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {otherErrors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            )}
            {state.orderId && (
              <Link href={`/historial/${state.orderId}`} className="mt-2 inline-block font-semibold underline">
                Ver la orden
              </Link>
            )}
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="font-semibold">Dirección de envío</span>
          <textarea
            name="shipping_address"
            rows={3}
            required
            defaultValue={defaultAddress}
            placeholder="Colonia, calle, número de casa, municipio"
            className="rounded-lg border border-anil/25 px-4 py-3"
          />
          {state.fieldErrors?.shipping_address?.map((e) => <span key={e} className="text-sm text-error">{e}</span>)}
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-semibold">Método de pago (Stripe modo prueba)</legend>
          {testCards.map((c, i) => (
            <label key={c.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-anil/15 p-3 has-[:checked]:border-anil has-[:checked]:bg-anil-soft">
              <input type="radio" name="payment_method" value={c.value} defaultChecked={i === 0} className="accent-anil" />
              <span className="flex-1 font-semibold">{c.label}</span>
              <span className="text-sm text-gris">{c.hint}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <aside className="flex h-fit flex-col gap-3 rounded-2xl bg-white p-5">
        <h2 className="text-lg font-bold">Tu orden</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-2">
              <span>{l.quantity} × {l.name}</span>
              <span>{formatMoney(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-anil/10 pt-2 font-extrabold">
          <span>Subtotal</span><span>{formatMoney(subtotal)}</span>
        </div>
        <p className="text-sm text-gris">La API agrega el IVA (13 %) y valida el stock antes de cobrar.</p>
        <SubmitButton pendingText="Procesando pago...">Confirmar y pagar</SubmitButton>
      </aside>
    </form>
  );
}
