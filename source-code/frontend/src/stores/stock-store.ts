import { create } from "zustand";
import type { ProductStatus, StockUpdateEvent } from "@/types";

type StockEntry = {
  stock: number;
  status: ProductStatus;
  stockUpdatedAt: string;
};

interface StockState {
  /** Map of productId -> live stock data */
  stockMap: Record<string, StockEntry>;

  /** Apply stock updates from SSE events */
  applyUpdates: (updates: StockUpdateEvent[]) => void;

  /** Get live stock for a single product (undefined if no SSE update received yet) */
  getStock: (productId: string) => StockEntry | undefined;
}

export const useStockStore = create<StockState>()((set, get) => ({
  stockMap: {},

  applyUpdates: (updates) => {
    if (updates.length === 0) return;

    set((state) => {
      const next = { ...state.stockMap };

      for (const update of updates) {
        // Validate each update before applying
        if (
          typeof update.productId !== "string" ||
          update.productId.length === 0 ||
          typeof update.stock !== "number" ||
          !Number.isFinite(update.stock) ||
          update.stock < 0 ||
          (update.status !== "AVAILABLE" && update.status !== "OUT_OF_STOCK") ||
          typeof update.stockUpdatedAt !== "string"
        ) {
          continue; // Skip malformed entries
        }

        next[update.productId] = {
          stock: Math.floor(update.stock),
          status: update.status,
          stockUpdatedAt: update.stockUpdatedAt,
        };
      }

      return { stockMap: next };
    });
  },

  getStock: (productId) => {
    return get().stockMap[productId];
  },
}));
