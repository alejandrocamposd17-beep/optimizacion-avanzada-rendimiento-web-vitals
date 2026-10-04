"use client";

import { SegmentError } from "@/components/SegmentError";

export default function RootError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <SegmentError {...props} title="Algo salió mal" />;
}
