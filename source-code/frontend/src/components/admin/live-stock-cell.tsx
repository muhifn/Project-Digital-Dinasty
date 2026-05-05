"use client";

import { useStockStore } from "@/stores/stock-store";

type LiveStockCellProps = {
  productId: string;
  initialStock: number;
  unit: string;
};

/**
 * Client component for the admin products table stock column.
 * Shows real-time stock from SSE, falls back to server-rendered value.
 */
export function LiveStockCell({ productId, initialStock, unit }: LiveStockCellProps) {
  const liveEntry = useStockStore((s) => s.stockMap[productId]);
  const stock = liveEntry?.stock ?? initialStock;
  const isLive = liveEntry !== undefined;

  return (
    <span className={isLive ? "font-semibold text-brand-primary" : ""}>
      {stock} {unit}
      {isLive && (
        <span className="ml-1 inline-block size-1.5 rounded-full bg-[#2d6a4f]" title="Live updated" />
      )}
    </span>
  );
}
