import { describe, it, expect, beforeEach } from "vitest";
import { useStockStore } from "@/stores/stock-store";
import type { StockUpdateEvent } from "@/types";

describe("stock-store", () => {
  beforeEach(() => {
    // Reset store state between tests
    useStockStore.setState({ stockMap: {} });
  });

  it("starts with empty stockMap", () => {
    const state = useStockStore.getState();
    expect(state.stockMap).toEqual({});
  });

  it("applies stock updates", () => {
    const { applyUpdates } = useStockStore.getState();
    applyUpdates([
      {
        productId: "prod-1",
        stock: 10,
        status: "AVAILABLE",
        stockUpdatedAt: "2025-06-15T00:00:00Z",
      },
      {
        productId: "prod-2",
        stock: 0,
        status: "OUT_OF_STOCK",
        stockUpdatedAt: "2025-06-15T00:00:00Z",
      },
    ]);

    const state = useStockStore.getState();
    expect(state.stockMap["prod-1"]).toEqual({
      stock: 10,
      status: "AVAILABLE",
      stockUpdatedAt: "2025-06-15T00:00:00Z",
    });
    expect(state.stockMap["prod-2"]).toEqual({
      stock: 0,
      status: "OUT_OF_STOCK",
      stockUpdatedAt: "2025-06-15T00:00:00Z",
    });
  });

  it("does nothing for empty updates array", () => {
    const { applyUpdates } = useStockStore.getState();
    applyUpdates([]);
    expect(useStockStore.getState().stockMap).toEqual({});
  });

  it("merges updates with existing data", () => {
    const { applyUpdates } = useStockStore.getState();
    applyUpdates([
      {
        productId: "prod-1",
        stock: 10,
        status: "AVAILABLE",
        stockUpdatedAt: "2025-06-15T00:00:00Z",
      },
    ]);
    applyUpdates([
      {
        productId: "prod-1",
        stock: 5,
        status: "AVAILABLE",
        stockUpdatedAt: "2025-06-15T01:00:00Z",
      },
    ]);

    expect(useStockStore.getState().stockMap["prod-1"].stock).toBe(5);
  });

  it("getStock returns entry for existing product", () => {
    const { applyUpdates } = useStockStore.getState();
    applyUpdates([
      {
        productId: "prod-1",
        stock: 7,
        status: "AVAILABLE",
        stockUpdatedAt: "2025-06-15T00:00:00Z",
      },
    ]);

    const entry = useStockStore.getState().getStock("prod-1");
    expect(entry).toBeDefined();
    expect(entry!.stock).toBe(7);
  });

  it("getStock returns undefined for non-existent product", () => {
    const entry = useStockStore.getState().getStock("non-existent");
    expect(entry).toBeUndefined();
  });

  it("ignores malformed updates", () => {
    const { applyUpdates } = useStockStore.getState();

    applyUpdates([
      {
        productId: "prod-1",
        stock: 5,
        status: "AVAILABLE",
        stockUpdatedAt: "2025-06-15T00:00:00Z",
      },
      {
        productId: "",
        stock: 99,
        status: "AVAILABLE",
        stockUpdatedAt: "2025-06-15T00:00:00Z",
      } as unknown as StockUpdateEvent,
      {
        productId: "prod-2",
        stock: -10,
        status: "OUT_OF_STOCK",
        stockUpdatedAt: "2025-06-15T00:00:00Z",
      } as unknown as StockUpdateEvent,
      {
        productId: "prod-3",
        stock: 2,
        status: "INVALID",
        stockUpdatedAt: "2025-06-15T00:00:00Z",
      } as unknown as StockUpdateEvent,
    ]);

    const state = useStockStore.getState();
    expect(Object.keys(state.stockMap)).toEqual(["prod-1"]);
    expect(state.stockMap["prod-1"].stock).toBe(5);
  });
});
