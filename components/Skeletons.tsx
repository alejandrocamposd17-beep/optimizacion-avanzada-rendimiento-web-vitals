export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Cargando productos">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-2xl bg-white p-3">
          <div className="skeleton aspect-[4/3] w-full rounded-xl" />
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-6 w-1/4 rounded" />
          <div className="skeleton h-10 w-40 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function OrderListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando compras">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-center justify-between rounded-2xl bg-white p-5">
          <div className="flex flex-col gap-2">
            <div className="skeleton h-5 w-40 rounded" />
            <div className="skeleton h-4 w-28 rounded" />
          </div>
          <div className="skeleton h-7 w-24 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
