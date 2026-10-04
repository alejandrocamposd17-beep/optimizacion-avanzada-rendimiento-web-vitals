import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl bg-white p-8">
      <h1 className="text-2xl font-bold">No encontramos esta página</h1>
      <p className="mt-2 text-gris">El producto u orden que buscas no existe o no pertenece a tu cuenta.</p>
      <Link href="/" className="mt-6 inline-block rounded-lg bg-anil px-5 py-2.5 font-semibold text-white">Ir al catálogo</Link>
    </div>
  );
}
