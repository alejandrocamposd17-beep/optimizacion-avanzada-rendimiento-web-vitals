"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { apiFetch, ApiError, extractAuth, extractPaymentId, extractPaymentStatus, PRODUCTS_TAG } from "./api";
import { clearSession, getToken, saveSession } from "./session";
import type { ActionState, CartLine } from "./types";

/** Solo permitimos redirecciones internas para evitar open redirects (?next=https://...). */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function toState(error: unknown): ActionState {
  if (error instanceof ApiError) return { ok: false, message: error.message, fieldErrors: error.errors };
  return { ok: false, message: "Ocurrió un error inesperado. Intenta de nuevo." };
}

/* ---------------- Autenticación ---------------- */

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, message: "Escribe tu correo y contraseña." };

  try {
    const env = await apiFetch("/auth/login", { method: "POST", body: { email, password }, cache: "no-store" });
    const { token, user } = extractAuth(env);
    if (!token) return { ok: false, message: "La API no devolvió un token." };
    await saveSession(token, user.name || email);
  } catch (error) {
    return toState(error);
  }
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const body = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    password_confirmation: String(formData.get("password_confirmation") ?? ""),
  };
  if (body.password !== body.password_confirmation) {
    return { ok: false, fieldErrors: { password_confirmation: ["Las contraseñas no coinciden."] } };
  }

  try {
    const env = await apiFetch("/auth/register", { method: "POST", body, cache: "no-store" });
    const { token, user } = extractAuth(env);
    if (!token) return { ok: false, message: "La API no devolvió un token." };
    await saveSession(token, user.name || body.name);
  } catch (error) {
    return toState(error);
  }
  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  const token = await getToken();
  if (token) {
    // Revoca el token en Sanctum; si falla igual cerramos la sesión local.
    await apiFetch("/auth/logout", { method: "POST", token, cache: "no-store" }).catch(() => null);
  }
  await clearSession();
  revalidatePath("/", "layout");
  redirect("/");
}

/* ---------------- Orden + pago con Stripe ---------------- */

async function payOrder(token: string, orderId: number, paymentMethod: string) {
  // 1) POST /orders/{id}/pay -> crea el PaymentIntent en Stripe (devuelve client_secret + id del pago)
  const intent = await apiFetch(`/orders/${orderId}/pay`, { method: "POST", token, cache: "no-store" });
  const paymentId = extractPaymentId(intent);
  // 2) POST /payments/{id}/confirm -> confirma el PaymentIntent en modo prueba
  const confirmed = await apiFetch(`/payments/${paymentId}/confirm`, {
    method: "POST",
    token,
    body: { payment_method: paymentMethod },
    cache: "no-store",
  });
  return extractPaymentStatus(confirmed);
}

/** Evita UI desactualizada: historial, detalle y stock del catálogo se refrescan tras la mutación. */
function refreshAfterPurchase(orderId?: number) {
  updateTag(PRODUCTS_TAG); // el stock cambió: el catálogo cacheado se descarta de inmediato
  revalidatePath("/historial");
  if (orderId) revalidatePath(`/historial/${orderId}`);
}

const ALLOWED_METHODS = new Set(["pm_card_visa", "pm_card_mastercard", "pm_card_chargeDeclined", "pm_card_insufficientFunds"]);

export async function checkoutAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await getToken();
  if (!token) redirect("/login?next=/checkout");

  let lines: CartLine[] = [];
  try {
    lines = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    return { ok: false, message: "El carrito no es válido." };
  }
  const items = lines
    .filter((l) => Number.isInteger(l.productId) && l.quantity > 0)
    .map((l) => ({ product_id: l.productId, quantity: Math.floor(l.quantity) }));
  if (items.length === 0) return { ok: false, message: "Tu carrito está vacío." };

  const shipping_address = String(formData.get("shipping_address") ?? "").trim();
  if (shipping_address.length < 5) {
    return { ok: false, fieldErrors: { shipping_address: ["Escribe una dirección de envío completa."] } };
  }
  const paymentMethod = String(formData.get("payment_method") ?? "pm_card_visa");
  if (!ALLOWED_METHODS.has(paymentMethod)) return { ok: false, message: "Método de pago no permitido." };

  let orderId: number | undefined;
  try {
    // POST /orders -> la API valida stock, calcula IVA 13 % y descuenta inventario
    const created = await apiFetch<Record<string, unknown>>("/orders", {
      method: "POST",
      token,
      body: { items, shipping_address },
      cache: "no-store",
    });
    const data = (created.data ?? {}) as Record<string, unknown>;
    orderId = Number((data.data as Record<string, unknown> | undefined)?.id ?? data.id);

    await payOrder(token, orderId, paymentMethod);
  } catch (error) {
    if (orderId) {
      refreshAfterPurchase(orderId);
      const state = toState(error);
      // 402: Stripe rechazó la tarjeta y la API marca la orden como "failed" (no se puede volver a pagar).
      if (error instanceof ApiError && error.status === 402) {
        return {
          ok: false,
          orderId,
          message: `${state.message} La orden quedó registrada como rechazada. Elige otra tarjeta y vuelve a confirmar para generar una nueva orden.`,
        };
      }
      // Otros errores (p. ej. 502 de Stripe): la orden sigue "pending" y puede pagarse desde el historial.
      return { ...state, orderId, message: `Se creó la orden, pero el pago no se completó: ${state.message}` };
    }
    if (error instanceof ApiError && error.status === 401) redirect("/login?next=/checkout&expired=1");
    return toState(error);
  }

  refreshAfterPurchase(orderId);
  redirect(`/checkout/confirmacion/${orderId}`);
}

/** Reintentar el pago de una orden pendiente desde el historial (la API solo permite pagar órdenes "pending"). */
export async function retryPaymentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await getToken();
  if (!token) redirect("/login?next=/historial");
  const orderId = Number(formData.get("order_id"));
  const paymentMethod = String(formData.get("payment_method") ?? "pm_card_visa");
  if (!ALLOWED_METHODS.has(paymentMethod)) return { ok: false, message: "Método de pago no permitido." };

  try {
    await payOrder(token, orderId, paymentMethod);
  } catch (error) {
    refreshAfterPurchase(orderId);
    return toState(error);
  }
  refreshAfterPurchase(orderId);
  redirect(`/checkout/confirmacion/${orderId}`);
}
