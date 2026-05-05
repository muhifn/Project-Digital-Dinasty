export function formatCurrency(value: number | string): string {
  const amount = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(amount)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatStock(stock: number, unit: string): string {
  return `${stock} ${unit}`;
}
