"use client";

import { useStockStore } from "@/stores/stock-store";
import { formatStock } from "@/lib/format";

type LiveStockTextProps = {
  productId: string;
  initialStock: number;
  unit: string;
};

/**
 * Client component that displays live stock quantity text.
 * Overlays SSE real-time data on top of server-rendered initial value.
 */
export function LiveStockText({ productId, initialStock, unit }: LiveStockTextProps) {
  const liveEntry = useStockStore((s) => s.stockMap[productId]);
  const stock = liveEntry?.stock ?? initialStock;

  return <>{formatStock(stock, unit)}</>;
}
