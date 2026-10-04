import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { ProductTile } from "@/components/ProductTile";
import { AddToCartButton } from "@/components/AddToCartButton";

export async function generateMetadata({ params }: PageProps<"/productos/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = await getProduct(id).catch(() => null);
  return p ? { title: p.name, description: p.description ?? undefined } : { title: "Producto no encontrado" };
}

export default async function ProductPage({ params }: PageProps<"/productos/[id]">) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="font-semibold text-anil hover:underline">Volver al catálogo</Link>
      <div className="grid gap-8 rounded-3xl bg-white p-5 sm:p-8 md:grid-cols-2">
        <ProductTile product={product} size="hero" preload />
        <div className="flex flex-col gap-4">
          {product.category && <p className="text-gris">{product.category}</p>}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="text-3xl font-extrabold text-anil">{formatMoney(product.price)}</p>
          <p className={product.stock > 0 ? "text-gris" : "font-semibold text-error"}>
            {product.stock > 0 ? `${product.stock} unidades disponibles` : "Agotado"}
          </p>
          {product.description && <p className="max-w-prose text-lg leading-relaxed">{product.description}</p>}
          <div className="pt-2">
            <AddToCartButton product={product} withQuantity />
          </div>
        </div>
      </div>
    </div>
  );
}
