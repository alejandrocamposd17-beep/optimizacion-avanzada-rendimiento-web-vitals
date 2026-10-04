"use client";

import { SegmentError } from "@/components/SegmentError";

export default function CheckoutError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <SegmentError {...props} title="No se pudo procesar el pago" />;
}
