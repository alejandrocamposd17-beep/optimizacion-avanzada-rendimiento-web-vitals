import type { Order } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

export function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xl font-bold">Orden {order.orderNumber}</p>
          {order.createdAt && <p className="text-sm text-gris">{formatDate(order.createdAt)}</p>}
        </div>
        <StatusBadge status={order.status} />
      </div>
      {order.items.length > 0 && (
        <table className="w-full text-left">
          <caption className="sr-only">Productos de la orden</caption>
          <thead className="text-sm text-gris">
            <tr><th className="py-1 font-normal">Producto</th><th className="py-1 font-normal">Cant.</th><th className="py-1 text-right font-normal">Subtotal</th></tr>
          </thead>
          <tbody>
            {order.items.map((i, idx) => (
              <tr key={idx} className="border-t border-anil/10">
                <td className="py-2">{i.name}</td>
                <td className="py-2">{i.quantity}</td>
                <td className="py-2 text-right">{formatMoney(i.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <dl className="ml-auto flex w-full max-w-xs flex-col gap-1">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
        <div className="flex justify-between"><dt>IVA</dt><dd>{formatMoney(order.tax)}</dd></div>
        <div className="flex justify-between border-t border-anil/10 pt-1 text-lg font-extrabold"><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div>
      </dl>
      {order.shippingAddress && <p className="text-sm text-gris">Envío a: {order.shippingAddress}</p>}
    </div>
  );
}
