"use client";

import { useStockStore } from "@/stores/stock-store";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

type LiveStockBadgeProps = {
  productId: string;
  initialStock: number;
  threshold?: number;
  className?: string;
};

/**
 * Client-side stock badge that overlays real-time stock data on top of
 * the server-rendered initial value. Falls back to initialStock if no
 * SSE update has been received for this product.
 */
export function LiveStockBadge({
  productId,
  initialStock,
  threshold = 5,
  className,
}: LiveStockBadgeProps) {
  const { messages } = useLocale();
  const liveEntry = useStockStore((s) => s.stockMap[productId]);
  const stock = liveEntry?.stock ?? initialStock;

  const status = stock <= 0 ? "out" : stock <= threshold ? "low" : "ok";

  return (
    <Badge
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold",
        status === "out" && "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/10",
        status === "low" && "bg-[#fff4db] text-[#8c5e00] hover:bg-[#fff4db]",
        status === "ok" && "bg-[#e6f4ee] text-[#2d6a4f] hover:bg-[#e6f4ee]",
        className
      )}
    >
      {status === "out"
        ? messages.productsPage.outOfStock
        : status === "low"
          ? messages.productsPage.lowStock
          : messages.productsPage.available}
    </Badge>
  );
}
