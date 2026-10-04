/**
 * API simulada (opcional) que replica el contrato de ecommerce-api-laravel.
 * Sirve para revisar el frontend cuando Laravel no está disponible.
 * NO reemplaza a la API real: las evidencias de Swagger y Stripe deben tomarse con Laravel.
 *
 * Uso: npm run mock-api   (escucha en http://localhost:8000/api)
 */
import http from "node:http";
import crypto from "node:crypto";

const PORT = Number(process.env.MOCK_PORT ?? 8000);
const categories = ["Hogar", "Tecnología", "Cocina", "Oficina"];
const names = [
  "Hamaca de algodón", "Audífonos inalámbricos", "Comal de barro", "Libreta de pasta dura",
  "Taza de cerámica", "Teclado mecánico", "Juego de cuchillos", "Lámpara de escritorio",
  "Cojín bordado", "Cargador USB-C", "Molcajete de piedra", "Organizador de escritorio",
  "Manta de añil", "Mouse ergonómico", "Olla de peltre", "Agenda 2026",
  "Canasta de mimbre", "Bocina portátil", "Tabla para picar", "Set de bolígrafos",
];
const products = names.map((name, i) => ({
  id: i + 1,
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  description: `${name} de muestra para probar el flujo de compra.`,
  price: Number((5 + ((i * 7.35) % 80)).toFixed(2)),
  stock: i === 3 ? 0 : 5 + (i % 10),
  category: categories[i % categories.length],
  is_active: true,
  // como los seeders de Laravel: la mitad con imagen de picsum, la otra mitad sin imagen
  image_url: i % 2 === 0 ? `https://picsum.photos/seed/p${i + 1}/600/400` : null,
}));
const users = [{ id: 1, name: "Alejandro Campos", email: "alejandro@example.com", password: "password" }];
const tokens = new Map();
const orders = [];
const payments = [];

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};
const ok = (res, data, message = "Operación exitosa", status = 200, extra = {}) =>
  send(res, status, { success: true, message, data, ...extra });
const fail = (res, status, message, errors) => send(res, status, { success: false, message, ...(errors ? { errors } : {}) });

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
  });

const authUser = (req) => tokens.get((req.headers.authorization ?? "").replace("Bearer ", ""));
const issue = (user) => {
  const token = `${user.id}|${crypto.randomBytes(20).toString("hex")}`;
  tokens.set(token, user);
  return { user: { id: user.id, name: user.name, email: user.email, role: "customer" }, token, token_type: "Bearer" };
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname.replace(/^\/api/, "");
  const m = req.method;
  await new Promise((r) => setTimeout(r, 250)); // latencia simulada para ver loading/Suspense

  if (m === "POST" && p === "/auth/register") {
    const b = await readBody(req);
    const errors = {};
    if (!b.name) errors.name = ["El nombre es obligatorio."];
    if (!b.email) errors.email = ["El correo es obligatorio."];
    else if (users.some((u) => u.email === b.email)) errors.email = ["El correo ya está registrado."];
    if (!b.password || b.password.length < 8) errors.password = ["La contraseña debe tener al menos 8 caracteres."];
    if (Object.keys(errors).length) return fail(res, 422, "Los datos enviados no son válidos.", errors);
    const user = { id: users.length + 1, name: b.name, email: b.email, password: b.password };
    users.push(user);
    return ok(res, issue(user), "Usuario registrado", 201);
  }
  if (m === "POST" && p === "/auth/login") {
    const b = await readBody(req);
    const user = users.find((u) => u.email === b.email && u.password === b.password);
    if (!user) return fail(res, 401, "Las credenciales proporcionadas son incorrectas.");
    return ok(res, issue(user), "Sesión iniciada");
  }
  if (m === "GET" && p === "/products") {
    const q = (url.searchParams.get("search") ?? "").toLowerCase();
    const per = Number(url.searchParams.get("per_page") ?? 12);
    const page = Number(url.searchParams.get("page") ?? 1);
    const list = products.filter((x) => x.name.toLowerCase().includes(q));
    const slice = list.slice((page - 1) * per, page * per);
    return ok(res, slice, "Productos", 200, {
      meta: { current_page: page, last_page: Math.max(1, Math.ceil(list.length / per)), per_page: per, total: list.length },
    });
  }
  let match = p.match(/^\/products\/(\d+)$/);
  if (m === "GET" && match) {
    const prod = products.find((x) => x.id === Number(match[1]));
    return prod ? ok(res, prod) : fail(res, 404, "Producto no encontrado.");
  }

  const user = authUser(req);
  if (!user) return fail(res, 401, "No autenticado.");

  if (m === "GET" && p === "/auth/me") return ok(res, { id: user.id, name: user.name, email: user.email, role: "customer", address: "San Salvador, El Salvador" });
  if (m === "POST" && p === "/auth/logout") return ok(res, null, "Sesión cerrada");
  if (m === "GET" && p === "/orders") return ok(res, orders.filter((o) => o.user_id === user.id).reverse());
  if (m === "POST" && p === "/orders") {
    const b = await readBody(req);
    const items = [];
    for (const it of b.items ?? []) {
      const prod = products.find((x) => x.id === it.product_id);
      if (!prod) return fail(res, 422, "Producto inválido.");
      if (prod.stock < it.quantity) return fail(res, 409, `Stock insuficiente para ${prod.name}.`);
      items.push({ product_id: prod.id, product_name: prod.name, quantity: it.quantity, unit_price: prod.price, subtotal: +(prod.price * it.quantity).toFixed(2) });
    }
    items.forEach((it) => (products.find((x) => x.id === it.product_id).stock -= it.quantity));
    const subtotal = +items.reduce((s, i) => s + i.subtotal, 0).toFixed(2);
    const tax = +(subtotal * 0.13).toFixed(2);
    const order = {
      id: orders.length + 1, user_id: user.id, order_number: `ORD-${String(orders.length + 1).padStart(5, "0")}`,
      status: "pending", subtotal, tax, total: +(subtotal + tax).toFixed(2), shipping_address: b.shipping_address,
      created_at: new Date().toISOString(), items,
    };
    orders.push(order);
    return ok(res, order, "Orden creada", 201);
  }
  match = p.match(/^\/orders\/(\d+)(\/pay)?$/);
  if (match) {
    const order = orders.find((o) => o.id === Number(match[1]) && o.user_id === user.id);
    if (!order) return fail(res, 404, "Orden no encontrada.");
    if (m === "GET" && !match[2]) return ok(res, order);
    if (m === "POST" && match[2]) {
      if (order.status !== "pending") return fail(res, 409, `La orden se encuentra en estado '${order.status}' y no puede pagarse.`);
      const existing = payments.find((x) => x.order_id === order.id && !["succeeded", "canceled"].includes(x.status));
      if (existing) return ok(res, existing, "Ya existe un intento de pago pendiente para esta orden.");
      const intent = `pi_mock_${Date.now()}`;
      const pay = {
        id: payments.length + 1, order_id: order.id, stripe_payment_intent_id: intent, client_secret: `${intent}_secret_mock`,
        amount: order.total, currency: "usd", status: "requires_payment_method", payment_method: null, paid_at: null,
      };
      payments.push(pay);
      return ok(res, pay, "Intento de pago creado. Use el client_secret para completar el pago.", 201);
    }
  }
  match = p.match(/^\/payments\/(\d+)\/confirm$/);
  if (m === "POST" && match) {
    const pay = payments.find((x) => x.id === Number(match[1]));
    if (!pay) return fail(res, 404, "Pago no encontrado.");
    const b = await readBody(req);
    const order = orders.find((o) => o.id === pay.order_id);
    if (["pm_card_chargeDeclined", "pm_card_insufficientFunds"].includes(b.payment_method)) {
      pay.status = "failed"; order.status = "failed";
      return fail(res, 402, "Pago rechazado: Your card was declined.");
    }
    pay.status = "succeeded"; pay.payment_method = b.payment_method; pay.paid_at = new Date().toISOString(); order.status = "paid";
    const publicPay = { ...pay };
    delete publicPay.client_secret; // como PaymentResource: no se expone tras el cobro
    return ok(res, publicPay, "Pago procesado correctamente.");
  }
  return fail(res, 404, "Ruta no encontrada.");
}).listen(PORT, () => console.log(`API simulada en http://localhost:${PORT}/api`));
