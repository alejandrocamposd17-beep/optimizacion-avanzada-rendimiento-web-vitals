import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TOKEN_COOKIE, USER_COOKIE } from "@/lib/session";

/**
 * Route Handler de sesión.
 * GET    -> indica si hay sesión activa (nunca expone el token al navegador).
 * DELETE -> cierra la sesión borrando la cookie httpOnly (útil para clientes o pruebas).
 */
export async function GET() {
  const store = await cookies();
  const authenticated = Boolean(store.get(TOKEN_COOKIE)?.value);
  return NextResponse.json(
    { authenticated, user: authenticated ? store.get(USER_COOKIE)?.value ?? null : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.delete(TOKEN_COOKIE);
  res.cookies.delete(USER_COOKIE);
  return res;
}
