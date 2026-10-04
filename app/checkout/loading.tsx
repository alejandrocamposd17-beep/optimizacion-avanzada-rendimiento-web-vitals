export default function CheckoutLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando pago">
      <div className="skeleton h-9 w-40 rounded" />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="skeleton h-80 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );
}
