"use client";

import { useEffect } from "react";
import Link from "next/link";

export function SegmentError({
  error,
  reset,
  title,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-xl rounded-2xl border-l-4 border-error bg-white p-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-gris">
        {error.message && !error.digest
          ? error.message
          : "El servidor no pudo completar la solicitud. Revisa que la API esté encendida y vuelve a intentarlo."}
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="rounded-lg bg-anil px-5 py-2.5 font-semibold text-white hover:bg-anil-deep">
          Reintentar
        </button>
        <Link href="/" className="rounded-lg px-5 py-2.5 font-semibold text-anil hover:bg-anil-soft">
          Ir al catálogo
        </Link>
      </div>
    </div>
  );
}
