"use client";

import { useActionState } from "react";
import { retryPaymentAction } from "@/lib/actions";
import type { ActionState } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";

export function RetryPaymentForm({ orderId }: { orderId: number }) {
  const [state, formAction] = useActionState(retryPaymentAction, {} as ActionState);
  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl bg-white p-6">
      <input type="hidden" name="order_id" value={orderId} />
      <h2 className="text-lg font-bold">Pagar esta orden</h2>
      {state.message && <p role="alert" className="rounded-lg bg-error/10 p-3 text-error">{state.message}</p>}
      <label className="flex flex-col gap-1.5">
        <span className="font-semibold">Tarjeta de prueba</span>
        <select name="payment_method" className="rounded-lg border border-anil/25 bg-white px-4 py-3">
          <option value="pm_card_visa">Visa de prueba (aprobada)</option>
          <option value="pm_card_mastercard">Mastercard de prueba (aprobada)</option>
          <option value="pm_card_chargeDeclined">Tarjeta rechazada</option>
        </select>
      </label>
      <SubmitButton pendingText="Procesando pago..." className="self-start">Pagar ahora</SubmitButton>
    </form>
  );
}
