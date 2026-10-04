import { Suspense } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/Skeletons";

export const metadata = { title: "Catálogo" };

type CatalogSearch = PageProps<"/">["searchParams"];

/**
 * La página no espera los searchParams: así el encabezado (elemento LCP) forma parte
 * del shell estático prerenderizado y se sirve al instante. La búsqueda y la lista
 * dependen de la URL y se transmiten por streaming dentro de <Suspense>.
 */
export default function CatalogPage({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-3xl bg-anil px-6 py-10 text-white sm:px-10">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Compra lo que necesitas y págalo en un solo paso.
        </h1>
        <p className="mt-3 max-w-xl text-lg text-white/85">
          Precios con IVA calculado al confirmar la orden. Pagos seguros con Stripe.
        </p>
        <Suspense fallback={<SearchForm />}>
          <SearchFormWithQuery searchParams={searchParams} />
        </Suspense>
      </section>

      <Suspense fallback={<ProductGridSkeleton />}>
        <CatalogResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function readSearch(searchParams: CatalogSearch) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);
  return { q, page };
}

/** Formulario GET: funciona sin JavaScript y no agrega peso al bundle. */
function SearchForm({ q = "" }: { q?: string }) {
  return (
    <form action="/" role="search" className="mt-6 flex max-w-xl gap-2">
      <label htmlFor="q" className="sr-only">Buscar productos</label>
      <input
        id="q"
        name="q"
        defaultValue={q}
        placeholder="Buscar por nombre"
        className="min-w-0 flex-1 rounded-lg border-0 bg-white px-4 py-3 text-tinta placeholder:text-gris"
      />
      <button className="rounded-lg bg-maiz px-5 py-3 font-bold text-tinta hover:brightness-95">Buscar</button>
    </form>
  );
}

async function SearchFormWithQuery({ searchParams }: { searchParams: CatalogSearch }) {
  const { q } = await readSearch(searchParams);
  return <SearchForm key={q} q={q} />;
}

async function CatalogResults({ searchParams }: { searchParams: CatalogSearch }) {
  const { q, page } = await readSearch(searchParams);
  // La key reinicia el Suspense en cada búsqueda o página: se ve el skeleton mientras carga
  return (
    <Suspense key={`${q}-${page}`} fallback={<ProductGridSkeleton />}>
      <ProductGrid q={q} page={page} />
    </Suspense>
  );
}

async function ProductGrid({ q, page }: { q: string; page: number }) {
  const { items, currentPage, lastPage, total } = await getProducts({ search: q, page });

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8">
        <p className="text-lg font-semibold">No encontramos productos{q ? ` para "${q}"` : ""}.</p>
        {q && <Link href="/" className="mt-2 inline-block font-semibold text-anil underline">Ver todo el catálogo</Link>}
      </div>
    );
  }

  const href = (p: number) => `/?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <section aria-labelledby="titulo-lista" className="flex flex-col gap-5">
      <h2 id="titulo-lista" className="text-gris">
        {total} {total === 1 ? "producto" : "productos"}{q ? ` para "${q}"` : ""}
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p, i) => (
          // Las primeras imágenes suelen ser el LCP: se precargan; el resto se carga en diferido
          <ProductCard key={p.id} product={p} preload={i < 2} />
        ))}
      </div>
      {lastPage > 1 && (
        <nav aria-label="Paginación" className="flex items-center justify-center gap-4 pt-2">
          {currentPage > 1 ? (
            <Link href={href(currentPage - 1)} className="rounded-lg bg-white px-4 py-2 font-semibold text-anil">Anterior</Link>
          ) : <span className="px-4 py-2 text-gris" aria-disabled="true">Anterior</span>}
          <span className="text-gris">Página {currentPage} de {lastPage}</span>
          {currentPage < lastPage ? (
            <Link href={href(currentPage + 1)} className="rounded-lg bg-white px-4 py-2 font-semibold text-anil">Siguiente</Link>
          ) : <span className="px-4 py-2 text-gris" aria-disabled="true">Siguiente</span>}
        </nav>
      )}
    </section>
  );
}
