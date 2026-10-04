import type { MetadataRoute } from "next";

/** Las rutas privadas (pago e historial) no deben indexarse. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/checkout", "/historial", "/carrito", "/api/"] },
  };
}
