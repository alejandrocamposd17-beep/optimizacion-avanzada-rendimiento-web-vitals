"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Reporta LCP, CLS, INP, FCP y TTFB reales del navegador.
 * En desarrollo se ven en la consola (evidencia complementaria a Lighthouse).
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[Web Vitals] ${metric.name}: ${Math.round(metric.value * 100) / 100} (${metric.rating})`);
    }
  });
  return null;
}
