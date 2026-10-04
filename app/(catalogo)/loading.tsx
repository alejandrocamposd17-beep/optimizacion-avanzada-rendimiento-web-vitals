import { ProductGridSkeleton } from "@/components/Skeletons";

export default function CatalogLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="skeleton h-56 rounded-3xl" />
      <ProductGridSkeleton />
    </div>
  );
}
