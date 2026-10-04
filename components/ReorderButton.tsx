"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import type { OrderItem } from "@/lib/types";

/** Una orden rechazada no se puede volver a pagar en la API: se vuelven a cargar sus productos al carrito. */
export function ReorderButton({ items }: { items: OrderItem[] }) {
  const { add } = useCart();
  const router = useRouter();

  function reorder() {
    items.forEach((i) => {
      if (i.productId) add({ productId: i.productId, name: i.name, price: i.unitPrice, stock: 100 }, i.quantity);
    });
    router.push("/carrito");
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-6">
      <h2 className="text-lg font-bold">El pago de esta orden fue rechazado</h2>
      <p className="text-gris">Puedes cargar los mismos productos al carrito y pagar con otra tarjeta.</p>
      <button onClick={reorder} className="self-start rounded-lg bg-anil px-5 py-3 font-semibold text-white hover:bg-anil-deep">
        Volver a comprar
      </button>
    </div>
  );
}
