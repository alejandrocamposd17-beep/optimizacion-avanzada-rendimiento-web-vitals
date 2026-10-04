import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { CartLink } from "@/components/CartLink";
import { WebVitals } from "@/components/WebVitals";
import { getSessionUserName } from "@/lib/session";
import { logoutAction } from "@/lib/actions";

export const metadata: Metadata = {
  title: { default: "Tienda Añil", template: "%s | Tienda Añil" },
  description:
    "Frontend e-commerce en Next.js que consume la API Laravel 12 con Stripe. Proyecto: Optimización Avanzada de Rendimiento.",
};

export const viewport: Viewport = { themeColor: "#233a8f" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const userName = await getSessionUserName();

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col antialiased">
        <WebVitals />
        <CartProvider>
          <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-2">
            Saltar al contenido
          </a>
          <header className="bg-anil-deep text-white">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
              <Link href="/" className="text-2xl font-extrabold tracking-tight">
                Tienda <span className="text-maiz">Añil</span>
              </Link>
              <nav aria-label="Principal" className="flex flex-1 flex-wrap items-center gap-1 text-[0.95rem]">
                <Link href="/" className="rounded-full px-3 py-2 hover:bg-white/10">Catálogo</Link>
                <Link href="/historial" className="rounded-full px-3 py-2 hover:bg-white/10">Mis compras</Link>
              </nav>
              <div className="flex items-center gap-2">
                {userName ? (
                  <>
                    <span className="hidden text-sm text-white/80 sm:inline">Hola, {userName.split(" ")[0]}</span>
                    <form action={logoutAction}>
                      <button className="rounded-full px-3 py-2 text-sm hover:bg-white/10">Cerrar sesión</button>
                    </form>
                  </>
                ) : (
                  <Link href="/login" className="rounded-full px-3 py-2 text-sm hover:bg-white/10">Iniciar sesión</Link>
                )}
                <CartLink />
              </div>
            </div>
          </header>
          <main id="contenido" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-anil/10 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gris">
              Proyecto académico de Alejandro Campos. Pagos en modo prueba de Stripe, no se cobra dinero real.
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
