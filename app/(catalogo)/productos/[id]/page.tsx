import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ApiError, getProduct } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { ProductTile } from "@/components/ProductTile";
import { AddToCartButton } from "@/components/AddToCartButton";

async function load(id: string) {
  try {
    return await getProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/productos/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const p = await getProduct(id);
    return { title: p.name, description: p.description ?? undefined };
  } catch {
    return { title: "Producto" };
  }
}

export default async function ProductPage({ params }: PageProps<"/productos/[id]">) {
  const { id } = await params;
  const product = await load(id);

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
