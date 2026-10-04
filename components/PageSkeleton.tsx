/** Skeleton genérico para rutas que dependen de cookies o parámetros (parte del shell estático). */
export function PageSkeleton({ narrow = true }: { narrow?: boolean }) {
  return (
    <div className={`mx-auto flex w-full flex-col gap-4 ${narrow ? "max-w-md" : "max-w-2xl"}`} aria-busy="true">
      <div className="skeleton h-9 w-48 rounded" />
      <div className="skeleton h-72 rounded-3xl" />
    </div>
  );
}
