import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { ProductTile } from "./ProductTile";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product, preload = false }: { product: Product; preload?: boolean }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_0_#d5dbec]">
      <Link href={`/productos/${product.id}`} className="block" prefetch={false}>
        <ProductTile product={product} preload={preload} />
      </Link>
      <div className="flex flex-1 flex-col gap-1 px-1">
        {product.category && <p className="text-sm text-gris">{product.category}</p>}
        <h2 className="text-lg font-bold leading-snug">
          <Link href={`/productos/${product.id}`} prefetch={false} className="hover:underline">
            {product.name}
          </Link>
        </h2>
        <div className="mt-auto flex items-baseline justify-between pt-2">
          <span className="text-xl font-extrabold text-anil">{formatMoney(product.price)}</span>
          <span className={`text-sm ${product.stock > 0 ? "text-gris" : "text-error"}`}>
            {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
          </span>
        </div>
      </div>
      <div className="px-1 pb-1">
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
