const money = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" });

export const formatMoney = (value: number) => money.format(Number.isFinite(value) ? value : 0);

export function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-SV", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export const statusLabel: Record<string, string> = {
  pending: "Pendiente de pago",
  paid: "Pagada",
  failed: "Pago rechazado",
  cancelled: "Cancelada",
};
