import { OrderListSkeleton } from "@/components/Skeletons";

export default function HistoryLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="skeleton h-9 w-48 rounded" />
      <OrderListSkeleton />
    </div>
  );
}
