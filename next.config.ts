import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false, // no exponer la versión del framework
  reactStrictMode: true,
  compress: true,
  images: {
    // Las imágenes de los seeders de la API vienen de picsum.photos (redirige a fastly.picsum.photos)
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
