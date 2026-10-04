"use client";

import { SegmentError } from "@/components/SegmentError";

export default function CatalogError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <SegmentError {...props} title="No se pudo cargar el catálogo" />;
}
