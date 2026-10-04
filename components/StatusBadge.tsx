import { statusLabel } from "@/lib/format";

const tone: Record<string, string> = {
  paid: "bg-ok/10 text-ok",
  pending: "bg-maiz/25 text-tinta",
  failed: "bg-error/10 text-error",
  cancelled: "bg-gris/15 text-gris",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${tone[status] ?? tone.cancelled}`}>
      {statusLabel[status] ?? status}
    </span>
  );
}
