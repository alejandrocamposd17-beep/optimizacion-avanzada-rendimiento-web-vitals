export default function ProductLoading() {
  return (
    <div className="grid gap-8 rounded-3xl bg-white p-8 md:grid-cols-2" aria-busy="true">
      <div className="skeleton aspect-[4/3] rounded-xl" />
      <div className="flex flex-col gap-4">
        <div className="skeleton h-5 w-24 rounded" />
        <div className="skeleton h-10 w-3/4 rounded" />
        <div className="skeleton h-9 w-32 rounded" />
        <div className="skeleton h-24 w-full rounded" />
      </div>
    </div>
  );
}
