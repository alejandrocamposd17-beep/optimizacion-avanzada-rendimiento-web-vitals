"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/** Vacía el carrito local una vez confirmada la compra. */
export function ClearCart() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
