/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import type { Product } from "@/lib/types";

/** Dominios que next/image puede optimizar (deben coincidir con remotePatterns en next.config.ts). */
const OPTIMIZED_HOSTS = new Set(["picsum.photos", "fastly.picsum.photos"]);

function hostOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Imagen del producto.
 * - Imágenes de dominios permitidos: next/image (redimensiona, sirve WebP/AVIF, lazy load y evita CLS).
 * - Otros dominios: <img> con dimensiones fijas.
 * - Sin imagen: lámina teñida con CSS y el monograma del producto (cero bytes de imagen).
 */
export function ProductTile({
  product,
  size = "card",
  preload = false,
}: {
  product: Product;
  size?: "card" | "hero";
  preload?: boolean;
}) {
  const image = product.image && /^https?:\/\//.test(product.image) ? product.image : null;
  const sizes = size === "hero" ? "(min-width: 768px) 560px, 100vw" : "(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw";

  if (image && OPTIMIZED_HOSTS.has(hostOf(image) ?? "")) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-anil-soft">
        <Image src={image} alt={product.name} fill sizes={sizes} preload={preload} className="object-cover" />
      </div>
    );
  }

  if (image) {
    return (
      <img
        src={image}
        alt={product.name}
        width={600}
        height={450}
        loading={preload ? "eager" : "lazy"}
        decoding="async"
        className="aspect-[4/3] w-full rounded-xl bg-anil-soft object-cover"
      />
    );
  }

  const hue = 200 + ((product.id * 37) % 70); // gama de índigos a violetas
  const initials = product.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="tile flex aspect-[4/3] w-full items-end rounded-xl p-4"
      style={{ ["--h" as string]: hue }}
      role="img"
      aria-label={product.name}
    >
      <span className={`font-extrabold leading-none text-white/90 ${size === "hero" ? "text-7xl" : "text-4xl"}`}>
        {initials}
      </span>
    </div>
  );
}
