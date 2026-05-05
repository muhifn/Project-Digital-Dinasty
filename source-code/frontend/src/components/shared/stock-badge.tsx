import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StockBadgeProps = {
  stock: number;
  threshold?: number;
  className?: string;
};

export function StockBadge({ stock, threshold = 5, className }: StockBadgeProps) {
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
      {status === "out" ? "Out of stock" : status === "low" ? "Low stock" : "Available"}
    </Badge>
  );
}
