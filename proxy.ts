import { NextResponse, type NextRequest } from "next/server";

const TOKEN_COOKIE = "ecommerce_token";

/**
 * Proxy (antes "middleware" en Next.js 15): protege las rutas privadas.
 * Si no existe la cookie httpOnly con el token, redirige a /login conservando el destino.
 * Si el usuario ya tiene sesión, no lo deja volver a /login o /registro.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);
  const isAuthPage = pathname === "/login" || pathname === "/registro";

  if (!hasToken && !isAuthPage) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (hasToken && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/historial/:path*", "/login", "/registro"],
};
