"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/**
 * Vacía el carrito local una sola vez por orden confirmada.
 * Con Cache Components la ruta puede quedar oculta y volver a mostrarse (<Activity>),
 * lo que re-ejecuta los efectos: sin esta marca se borraría un carrito nuevo al volver atrás.
 */
export function ClearCart({ orderId }: { orderId: number }) {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (!ready) return;
    const key = `tienda-anil-cleared-${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* sin sessionStorage: se limpia igual */
    }
    clear();
  }, [ready, clear, orderId]);
  return null;
}
