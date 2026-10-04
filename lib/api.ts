import "server-only";
import type { Order, OrderItem, Paginated, Product, User } from "./types";

/**
 * Cliente de la API Laravel 12 (ecommerce-api-laravel).
 * Todas las respuestas siguen el formato { success, message, data, errors? }.
 * Este módulo solo se ejecuta en el servidor: el token nunca llega al navegador.
 */
const BASE_URL = (process.env.API_BASE_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

export const PRODUCTS_TAG = "products";
export const ordersTag = (token: string) => `orders-${token.slice(-16)}`;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Envelope<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: Record<string, unknown>;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  next?: NextFetchRequestConfig;
  cache?: RequestCache;
};

export async function apiFetch<T = unknown>(path: string, opts: RequestOptions = {}): Promise<Envelope<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      next: opts.next,
      cache: opts.cache,
    });
  } catch {
    throw new ApiError(`No se pudo conectar con la API en ${BASE_URL}. Verifica que Laravel esté corriendo.`, 503);
  }

  let json: Envelope<T> = {};
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok || json.success === false) {
    throw new ApiError(json.message ?? `La API respondió con estado ${res.status}.`, res.status, json.errors);
  }
  return json;
}

/* ---------- Normalizadores (toleran Resources con o sin wrapper "data") ---------- */

const num = (v: unknown) => (typeof v === "number" ? v : Number.parseFloat(String(v ?? 0)) || 0);
type Raw = Record<string, unknown>;

function pickArray(value: unknown): Raw[] {
  if (Array.isArray(value)) return value as Raw[];
  if (value && typeof value === "object") {
    const obj = value as Raw;
    for (const key of ["data", "items", "products", "orders"]) {
      if (Array.isArray(obj[key])) return obj[key] as Raw[];
    }
  }
  return [];
}

function unwrap(value: unknown): Raw {
  const obj = (value ?? {}) as Raw;
  return obj.data && typeof obj.data === "object" && !Array.isArray(obj.data) ? (obj.data as Raw) : obj;
}

export function toProduct(raw: Raw): Product {
  return {
    id: num(raw.id),
    name: String(raw.name ?? "Producto"),
    slug: raw.slug ? String(raw.slug) : undefined,
    description: (raw.description as string) ?? null,
    price: num(raw.price),
    stock: num(raw.stock),
    category: (raw.category as string) ?? null,
    image: ((raw.image_url ?? raw.image) as string) ?? null,
  };
}

function toItem(raw: Raw): OrderItem {
  const quantity = num(raw.quantity);
  const unitPrice = num(raw.unit_price ?? raw.price);
  return {
    productId: raw.product_id ? num(raw.product_id) : undefined,
    name: String(raw.product_name ?? raw.name ?? (raw.product as Raw | undefined)?.name ?? "Producto"),
    quantity,
    unitPrice,
    subtotal: num(raw.subtotal ?? raw.total ?? quantity * unitPrice),
  };
}

export function toOrder(raw: Raw): Order {
  const o = unwrap(raw);
  return {
    id: num(o.id),
    orderNumber: String(o.order_number ?? `#${o.id}`),
    status: String(o.status ?? "pending"),
    subtotal: num(o.subtotal),
    tax: num(o.tax),
    total: num(o.total),
    shippingAddress: (o.shipping_address as string) ?? null,
    createdAt: (o.created_at as string) ?? null,
    items: pickArray(o.items ?? o.order_items).map(toItem),
  };
}

function toPaginated<T>(env: Envelope, map: (r: Raw) => T): Paginated<T> {
  const data = env.data as unknown;
  const items = pickArray(data).map(map);
  const holder = (data && !Array.isArray(data) ? (data as Raw) : {}) as Raw;
  const meta = ((holder.meta ?? env.meta ?? holder.pagination ?? holder) as Raw) || {};
  return {
    items,
    currentPage: num(meta.current_page ?? 1) || 1,
    lastPage: num(meta.last_page ?? 1) || 1,
    total: num(meta.total ?? items.length),
  };
}

/* ---------- Lecturas (Server Components) ---------- */

export async function getProducts(params: { search?: string; page?: number; perPage?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  qs.set("page", String(params.page ?? 1));
  qs.set("per_page", String(params.perPage ?? 12));
  const env = await apiFetch(`/products?${qs}`, {
    // Catálogo público: cacheado 60 s y etiquetado para invalidarlo tras una compra (stock).
    next: { revalidate: 60, tags: [PRODUCTS_TAG] },
  });
  return toPaginated(env, toProduct);
}

export async function getProduct(id: string) {
  const env = await apiFetch(`/products/${encodeURIComponent(id)}`, {
    next: { revalidate: 60, tags: [PRODUCTS_TAG, `product-${id}`] },
  });
  return toProduct(unwrap(env.data));
}

export async function getMe(token: string): Promise<User> {
  const env = await apiFetch(`/auth/me`, { token, cache: "no-store" });
  const u = unwrap(env.data);
  return {
    id: num(u.id),
    name: String(u.name ?? ""),
    email: String(u.email ?? ""),
    role: u.role as string,
    address: (u.address as string) ?? null,
  };
}

export async function getOrders(token: string) {
  const env = await apiFetch(`/orders?per_page=50`, { token, next: { revalidate: 300, tags: [ordersTag(token)] } });
  return toPaginated(env, toOrder).items;
}

export async function getOrder(token: string, id: string) {
  const env = await apiFetch(`/orders/${encodeURIComponent(id)}`, { token, cache: "no-store" });
  return toOrder(env.data as Raw);
}

/* ---------- Helpers para respuestas de mutaciones ---------- */

export function extractAuth(env: Envelope): { token: string; user: User } {
  const d = unwrap(env.data);
  const token = String(d.token ?? d.access_token ?? (env as Raw).token ?? "");
  const u = (d.user ?? {}) as Raw;
  return { token, user: { id: num(u.id), name: String(u.name ?? ""), email: String(u.email ?? "") } };
}

export function extractPaymentId(env: Envelope): number {
  const d = unwrap(env.data);
  const payment = (d.payment ?? {}) as Raw;
  return num(d.payment_id ?? payment.id ?? d.id);
}

export function extractPaymentStatus(env: Envelope): string {
  const d = unwrap(env.data);
  const payment = (d.payment ?? d) as Raw;
  return String(payment.status ?? "");
}
