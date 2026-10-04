import "server-only";
import { cookies } from "next/headers";

/** Nombre de la cookie httpOnly que guarda el token Bearer de Sanctum. */
export const TOKEN_COOKIE = "ecommerce_token";
/** Cookie NO sensible (sin token) solo para mostrar el nombre en la barra. */
export const USER_COOKIE = "ecommerce_user";

const ONE_DAY = 60 * 60 * 24;

export async function getToken() {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

export async function getSessionUserName() {
  return (await cookies()).get(USER_COOKIE)?.value ?? null;
}

export async function saveSession(token: string, userName: string) {
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true, // JavaScript del navegador no puede leerla (protege contra XSS)
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_DAY,
  });
  store.set(USER_COOKIE, userName, { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge: ONE_DAY });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(USER_COOKIE);
}
