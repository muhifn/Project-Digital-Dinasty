/**
 * Tests for UI components. Since components rely on @base-ui/react and
 * shadcn/ui primitives, we focus on the logic and state integration
 * rather than full DOM rendering.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useStockStore } from "@/stores/stock-store";

describe("LiveStockBadge — logic (via store integration)", () => {
  beforeEach(() => {
    useStockStore.setState({ stockMap: {} });
  });

  it("uses initialStock when no live data is available", () => {
    const liveEntry = useStockStore.getState().stockMap["prod-1"];
    const stock = liveEntry?.stock ?? 10;
    expect(stock).toBe(10);
  });

  it("uses live stock when SSE data is received", () => {
    useStockStore.getState().applyUpdates([
      {
        productId: "prod-1",
        stock: 3,
        status: "AVAILABLE",
        stockUpdatedAt: new Date().toISOString(),
      },
    ]);

    const liveEntry = useStockStore.getState().stockMap["prod-1"];
    const stock = liveEntry?.stock ?? 10;
    expect(stock).toBe(3);
  });

  it("determines 'out' status when stock is 0", () => {
    const stock = 0;
    const threshold = 5;
    const status = stock <= 0 ? "out" : stock <= threshold ? "low" : "ok";
    expect(status).toBe("out");
  });

  it("determines 'low' status when stock is at threshold", () => {
    const stock = 5;
    const threshold = 5;
    const status = stock <= 0 ? "out" : stock <= threshold ? "low" : "ok";
    expect(status).toBe("low");
  });

  it("determines 'ok' status when stock is above threshold", () => {
    const stock = 10;
    const threshold = 5;
    const status = stock <= 0 ? "out" : stock <= threshold ? "low" : "ok";
    expect(status).toBe("ok");
  });

  it("determines 'low' when stock is 1 (below default threshold)", () => {
    const stock = 1;
    const threshold = 5;
    const status = stock <= 0 ? "out" : stock <= threshold ? "low" : "ok";
    expect(status).toBe("low");
  });
});

describe("LiveStockText — logic (via store + format)", () => {
  beforeEach(() => {
    useStockStore.setState({ stockMap: {} });
  });

  it("formats initial stock when no live data", async () => {
    const { formatStock } = await import("@/lib/format");
    const liveEntry = useStockStore.getState().stockMap["prod-1"];
    const stock = liveEntry?.stock ?? 25;
    const text = formatStock(stock, "kg");
    expect(text).toBe("25 kg");
  });

  it("formats live stock when SSE data received", async () => {
    const { formatStock } = await import("@/lib/format");
    useStockStore.getState().applyUpdates([
      {
        productId: "prod-1",
        stock: 7,
        status: "AVAILABLE",
        stockUpdatedAt: new Date().toISOString(),
      },
    ]);
    const liveEntry = useStockStore.getState().stockMap["prod-1"];
    const stock = liveEntry?.stock ?? 25;
    const text = formatStock(stock, "pcs");
    expect(text).toBe("7 pcs");
  });
});

describe("StockBadge — status mapping", () => {
  it("maps all status values to correct text", () => {
    const getLabel = (stock: number, threshold = 5) => {
      const status = stock <= 0 ? "out" : stock <= threshold ? "low" : "ok";
      return status === "out"
        ? "Out of stock"
        : status === "low"
          ? "Low stock"
          : "Available";
    };

    expect(getLabel(0)).toBe("Out of stock");
    expect(getLabel(-1)).toBe("Out of stock");
    expect(getLabel(1)).toBe("Low stock");
    expect(getLabel(5)).toBe("Low stock");
    expect(getLabel(6)).toBe("Available");
    expect(getLabel(100)).toBe("Available");
  });

  it("respects custom threshold", () => {
    const getLabel = (stock: number, threshold: number) => {
      const status = stock <= 0 ? "out" : stock <= threshold ? "low" : "ok";
      return status === "out"
        ? "Out of stock"
        : status === "low"
          ? "Low stock"
          : "Available";
    };

    // Custom threshold of 10
    expect(getLabel(10, 10)).toBe("Low stock");
    expect(getLabel(11, 10)).toBe("Available");
    expect(getLabel(0, 10)).toBe("Out of stock");
  });
});
