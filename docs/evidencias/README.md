# Evidencias

Guardar aquí las capturas (PNG) y el reporte de Lighthouse con estos nombres:

| Archivo | Qué mostrar |
|---------|-------------|
| `01-swagger-endpoints.png` | Swagger UI con la lista de endpoints (auth, products, orders, payments) |
| `02-swagger-login.png` | `POST /api/auth/login` ejecutado con respuesta 200 y token |
| `03-swagger-orden-pago.png` | `POST /api/orders` y `POST /api/orders/{id}/pay` con respuesta |
| `04-catalogo.png` | Página `/` con productos |
| `05-detalle.png` | `/productos/{id}` |
| `06-login.png` | Inicio de sesión |
| `07-carrito.png` | Carrito con productos |
| `08-checkout.png` | Checkout con dirección y tarjeta de prueba |
| `09-confirmacion.png` | Pago aprobado |
| `10-historial.png` | `/historial` mostrando la orden pagada |
| `11-stripe-dashboard.png` | Pago en el dashboard de Stripe (modo prueba) |
| `lighthouse-catalogo.html` o `.png` | Reporte Lighthouse de `/` |
| `lighthouse-historial.png` | Reporte Lighthouse de `/historial` (opcional) |

## Cómo generar el reporte Lighthouse

1. Ejecutar en modo producción: `npm run build` y luego `npm start`.
2. Abrir `http://localhost:3000` en Chrome, en una ventana de incógnito (las extensiones afectan el puntaje).
3. DevTools (F12) > pestaña **Lighthouse** > modo *Navigation*, dispositivo *Mobile*, categorías Performance, Accessibility, Best Practices y SEO > **Analyze page load**.
4. Guardar con el menú de tres puntos > *Save as HTML*, o tomar captura.

Alternativa por consola:

```bash
npx lighthouse http://localhost:3000 --output html --output-path docs/evidencias/lighthouse-catalogo.html --chrome-flags="--headless"
```
