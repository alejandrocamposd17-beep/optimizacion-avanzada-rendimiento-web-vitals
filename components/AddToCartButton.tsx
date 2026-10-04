"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product, withQuantity = false }: { product: Product; withQuantity?: boolean }) {
  const { add, lines } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = lines.find((l) => l.productId === product.id)?.quantity ?? 0;
  const available = product.stock - inCart;

  if (product.stock <= 0) {
    return <p className="font-semibold text-error">Agotado</p>;
  }

  function handleAdd() {
    add({ productId: product.id, name: product.name, price: product.price, stock: product.stock }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {withQuantity && (
        <label className="flex items-center gap-2 text-sm">
          Cantidad
          <input
            type="number"
            min={1}
            max={Math.max(1, available)}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value) || 1, available)))}
            className="w-20 rounded-lg border border-anil/30 bg-white px-3 py-2"
          />
        </label>
      )}
      <button
        type="button"
        onClick={handleAdd}
        disabled={available <= 0}
        className="rounded-lg bg-anil px-4 py-2.5 font-semibold text-white hover:bg-anil-deep disabled:bg-gris/50"
      >
        {available <= 0 ? "Máximo en el carrito" : "Agregar al carrito"}
      </button>
      <span role="status" aria-live="polite" className="text-sm font-semibold text-ok">
        {added ? "Agregado" : ""}
      </span>
    </div>
  );
}
