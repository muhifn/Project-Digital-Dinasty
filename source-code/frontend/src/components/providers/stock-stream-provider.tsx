"use client";

import { useStockStream } from "@/hooks/use-stock-stream";

type StockStreamProviderProps = {
  children: React.ReactNode;
};

/**
 * Initializes the SSE stock stream connection.
 * Place this in layouts to enable real-time stock updates for all child pages.
 */
export function StockStreamProvider({ children }: StockStreamProviderProps) {
  useStockStream();
  return <>{children}</>;
}
