"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/carrito"
      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20"
      aria-label={`Carrito, ${count} productos`}
    >
      Carrito
      <span className="min-w-6 rounded-full bg-maiz px-2 text-center text-sm font-bold text-tinta" aria-hidden>
        {ready ? count : 0}
      </span>
    </Link>
  );
}
