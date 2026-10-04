# Optimización Avanzada de Rendimiento: Dominio de Web Vitals y Mutaciones Asíncronas en el Servidor

**Autor:** Alejandro Campos
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4
**API consumida:** [ecommerce-api-laravel](https://github.com/alejandrocamposd17-beep/ecommerce-api-laravel) (Laravel 12 + Sanctum + Swagger + Stripe)

Frontend de e-commerce ("Tienda Añil") que consume la API REST creada previamente e implementa el flujo completo de compra: catálogo, autenticación, carrito, orden, pago con Stripe e historial. Las lecturas se hacen con **Server Components** y todas las mutaciones con **Server Actions**, priorizando rendimiento (Web Vitals) y seguridad del token.

---

## Tabla de contenido

1. [Requisitos](#requisitos)
2. [Configuración del archivo .env](#configuración-del-archivo-env)
3. [Pasos para ejecutar el proyecto](#pasos-para-ejecutar-el-proyecto)
4. [Rutas implementadas](#rutas-implementadas)
5. [Endpoints de la API consumidos](#endpoints-de-la-api-consumidos)
6. [Arquitectura: lecturas y mutaciones](#arquitectura-lecturas-y-mutaciones)
7. [Autenticación segura](#autenticación-segura)
8. [Rendimiento y resiliencia](#rendimiento-y-resiliencia)
9. [Evidencias](#evidencias)
10. [Estructura del proyecto](#estructura-del-proyecto)

---

## Requisitos

- Node.js 20.9 o superior
- La API Laravel corriendo (por defecto en `http://localhost:8000`), con migraciones, seeders y llaves de Stripe en modo prueba configuradas según su propio README.

## Configuración del archivo .env

El proyecto incluye `.env.example`:

```env
# URL base de la API Laravel (incluye /api). Solo la usa el servidor de Next.js.
API_BASE_URL=http://localhost:8000/api
```

Copiarlo como `.env.local` y ajustar la URL si la API corre en otro host o puerto. La variable **no** lleva el prefijo `NEXT_PUBLIC_`, por lo que nunca se envía al navegador: todas las llamadas a la API salen desde el servidor de Next.js.

## Pasos para ejecutar el proyecto

```bash
# 1. Levantar primero la API Laravel (en su propia carpeta)
php artisan serve            # http://localhost:8000

# 2. Clonar este repositorio
git clone https://github.com/alejandrocamposd17-beep/optimizacion-avanzada-rendimiento-web-vitals.git
cd optimizacion-avanzada-rendimiento-web-vitals

# 3. Instalar dependencias
npm install

# 4. Configurar la URL de la API
cp .env.example .env.local

# 5a. Modo desarrollo
npm run dev                  # http://localhost:3000

# 5b. Modo producción (usar este para medir con Lighthouse)
npm run build
npm start
```

Usuario de prueba sembrado por la API: `alejandro@example.com` / `password`.

> **API simulada (opcional):** `npm run mock-api` levanta en el puerto 8000 una API en memoria con el mismo contrato que la de Laravel (respuestas `{ success, message, data }`, códigos 401/402/404/409/422). Sirve solo para revisar la interfaz sin Laravel; las capturas de Swagger y de Stripe se toman con la API real.

## Rutas implementadas

| Ruta | Tipo | Acceso | Descripción |
|------|------|--------|-------------|
| `/` | Server Component + Suspense | Público | Catálogo con búsqueda (`?q=`) y paginación (`?page=`) |
| `/productos/[id]` | Server Component | Público | Detalle del producto y botón para agregar al carrito |
| `/registro` | Server Action | Solo invitados | Crear cuenta (`POST /auth/register`) |
| `/login` | Server Action | Solo invitados | Iniciar sesión (`POST /auth/login`) |
| `/carrito` | Client Component | Público | Carrito en estado local: agregar, quitar y cambiar cantidades |
| `/checkout` | Server Action | Protegida | Dirección de envío, tarjeta de prueba, crea la orden y ejecuta el pago |
| `/checkout/confirmacion/[id]` | Server Component | Protegida | Confirmación de compra con el detalle devuelto por la API |
| `/historial` | Server Component + Suspense | Protegida | Historial de compras del usuario |
| `/historial/[id]` | Server Component + Server Action | Protegida | Detalle de una orden y reintento de pago si fue rechazado |
| `/api/session` | Route Handler | Público | `GET` estado de sesión (sin exponer el token), `DELETE` cierra sesión |

Las rutas protegidas se validan en `proxy.ts` (en Next.js 16 el antiguo `middleware.ts` se llama `proxy.ts`): sin cookie de sesión redirige a `/login?next=...`.

## Endpoints de la API consumidos

| Método | Endpoint | Dónde se usa |
|--------|----------|--------------|
| GET | `/api/products` | Catálogo (`lib/api.ts > getProducts`) |
| GET | `/api/products/{id}` | Detalle de producto |
| POST | `/api/auth/register` | `registerAction` |
| POST | `/api/auth/login` | `loginAction` |
| POST | `/api/auth/logout` | `logoutAction` (revoca el token en Sanctum) |
| POST | `/api/orders` | `checkoutAction` (crea la orden, valida stock, calcula IVA 13 %) |
| POST | `/api/orders/{id}/pay` | `checkoutAction` y `retryPaymentAction` (crea el PaymentIntent) |
| POST | `/api/payments/{id}/confirm` | Confirma el pago con tarjeta de prueba de Stripe |
| GET | `/api/orders` | Historial de compras |
| GET | `/api/orders/{id}` | Confirmación y detalle de orden |

## Arquitectura: lecturas y mutaciones

**Lecturas (Server Components).** `lib/api.ts` está marcado con `server-only`, así que el cliente HTTP y el token nunca terminan en el bundle del navegador. El catálogo usa la caché de datos de Next.js:

```ts
fetch(`${BASE_URL}/products`, { next: { revalidate: 60, tags: ["products"] } })
```

**Mutaciones (Server Actions en `lib/actions.ts`).** Login, registro, logout, creación de orden, pago y reintento de pago. Los formularios usan `useActionState` para mostrar errores de validación (422) y `useFormStatus` para deshabilitar el botón mientras la mutación está en curso, evitando dobles envíos.

**Flujo de pago en una sola mutación:**

1. `POST /orders` crea la orden (la API valida stock y descuenta inventario).
2. `POST /orders/{id}/pay` crea el PaymentIntent en Stripe.
3. `POST /payments/{id}/confirm` confirma el cobro con la tarjeta de prueba elegida.
4. Se invalida la caché y se redirige a la confirmación.

Si la tarjeta es rechazada (402), la orden queda creada como `failed` y el usuario puede reintentar desde `/historial/[id]`.

**Sin interfaces desactualizadas después de mutar:**

```ts
updateTag(ordersTag(token));   // historial del usuario: el siguiente request trae datos frescos
updateTag("products");         // el stock del catálogo se actualiza tras la compra
revalidatePath("/historial");
revalidatePath(`/historial/${orderId}`);
revalidatePath("/", "layout"); // tras login/logout, la barra muestra la sesión correcta
```

En Next.js 16, `updateTag` es la variante de `revalidateTag` pensada para Server Actions (lectura de lo que uno mismo escribió).

## Autenticación segura

- El token Bearer de Sanctum se guarda en la cookie `ecommerce_token` con `httpOnly`, `sameSite=lax`, `secure` en producción y vida de 24 h. JavaScript del navegador no puede leerla, lo que protege contra robo por XSS.
- La cookie se escribe desde el servidor (Server Action) y se valida en `proxy.ts`. El Route Handler `/api/session` permite consultar o cerrar la sesión sin exponer el token.
- El parámetro `next` del login solo acepta rutas internas para evitar redirecciones abiertas.
- `API_BASE_URL` es una variable solo de servidor.

## Rendimiento y resiliencia

| Requisito | Implementación |
|-----------|----------------|
| `loading.tsx` en rutas clave | `app/(catalogo)/loading.tsx`, `app/(catalogo)/productos/[id]/loading.tsx`, `app/checkout/loading.tsx`, `app/historial/loading.tsx` |
| `error.tsx` por segmento | `app/error.tsx`, `app/(catalogo)/error.tsx`, `app/checkout/error.tsx`, `app/historial/error.tsx` con botón **Reintentar** (`reset()`) |
| Suspense en sección pesada | Lista de productos (`/`) e historial (`/historial`) se transmiten por streaming con skeletons |
| Evitar UI desactualizada | `updateTag` y `revalidatePath` después de cada mutación |
| Medición de Web Vitals | `components/WebVitals.tsx` usa `useReportWebVitals` (LCP, CLS, INP, FCP, TTFB en consola en desarrollo) + reporte Lighthouse |

Otras decisiones para Web Vitals:

- **LCP:** imágenes de producto con `next/image` (redimensionadas, AVIF/WebP, `sizes` por breakpoint) y `preload` solo en las primeras del catálogo y en el detalle; el resto se carga en diferido. Productos sin imagen usan una lámina generada con CSS. Sin fuentes web: tipografía del sistema.
- **CLS:** skeletons con las mismas dimensiones del contenido final y contenedores de imagen con relación de aspecto fija (`aspect-[4/3]`).
- **INP:** casi todo es Server Component; el JavaScript del cliente se limita al carrito y a los formularios. La búsqueda es un formulario GET que funciona sin JavaScript.
- **TTFB:** catálogo cacheado 60 s con etiqueta `products`.
- Accesibilidad: enlace "Saltar al contenido", foco visible, `aria-live` en estados y respeto a `prefers-reduced-motion`.

## Evidencias

Las capturas van en `docs/evidencias/` (ver `docs/evidencias/README.md` para la lista exacta):

- Endpoints consumidos desde Swagger (`http://localhost:8000/api/documentation`)
- Prueba del flujo completo de compra
- Reporte de rendimiento Lighthouse

## Estructura del proyecto

```
app/
├── (catalogo)/
│   ├── page.tsx                 # Catálogo + Suspense
│   ├── loading.tsx · error.tsx
│   └── productos/[id]/          # Detalle de producto
├── login/ · registro/           # Autenticación (Server Actions)
├── carrito/                     # Carrito (estado local)
├── checkout/
│   ├── page.tsx · loading.tsx · error.tsx
│   └── confirmacion/[id]/       # Confirmación de compra
├── historial/
│   ├── page.tsx · loading.tsx · error.tsx
│   └── [id]/                    # Detalle y reintento de pago
├── api/session/route.ts         # Route Handler de sesión
├── layout.tsx · error.tsx · not-found.tsx
components/                      # UI (CartProvider, CheckoutForm, Skeletons, WebVitals...)
lib/
├── api.ts                       # Cliente server-only de la API + normalizadores
├── actions.ts                   # Server Actions (mutaciones)
├── session.ts                   # Cookie httpOnly
└── types.ts · format.ts
proxy.ts                         # Protección de rutas
scripts/mock-api.mjs             # API simulada opcional
docs/evidencias/                 # Capturas y reporte Lighthouse
```

---

Proyecto académico desarrollado por **Alejandro Campos**.
