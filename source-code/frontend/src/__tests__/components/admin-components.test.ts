/**
 * Tests for admin component logic — LiveStockCell status derivation
 * and admin shell action patterns.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useStockStore } from "@/stores/stock-store";

describe("LiveStockCell — admin table live stock", () => {
  beforeEach(() => {
    useStockStore.setState({ stockMap: {} });
  });

  it("shows initial stock when no SSE data received", () => {
    const liveEntry = useStockStore.getState().stockMap["prod-admin-1"];
    const stock = liveEntry?.stock ?? 50;
    expect(stock).toBe(50);
  });

  it("overlays live stock when SSE update arrives", () => {
    useStockStore.getState().applyUpdates([
      {
        productId: "prod-admin-1",
        stock: 42,
        status: "AVAILABLE",
        stockUpdatedAt: new Date().toISOString(),
      },
    ]);

    const liveEntry = useStockStore.getState().stockMap["prod-admin-1"];
    const stock = liveEntry?.stock ?? 50;
    expect(stock).toBe(42);
  });

  it("detects stock status change (AVAILABLE → OUT_OF_STOCK)", () => {
    useStockStore.getState().applyUpdates([
      {
        productId: "prod-admin-1",
        stock: 0,
        status: "OUT_OF_STOCK",
        stockUpdatedAt: new Date().toISOString(),
      },
    ]);

    const liveEntry = useStockStore.getState().stockMap["prod-admin-1"];
    expect(liveEntry?.status).toBe("OUT_OF_STOCK");
    expect(liveEntry?.stock).toBe(0);
  });
});

describe("Admin action button styles", () => {
  it("exports consistent style patterns", async () => {
    const {
      ADMIN_ACTION_BUTTON,
      ADMIN_ACTION_EDIT_BUTTON,
      ADMIN_ACTION_DELETE_BUTTON,
    } = await import("@/components/admin/action-button-styles");

    expect(ADMIN_ACTION_BUTTON).toBeDefined();
    expect(typeof ADMIN_ACTION_BUTTON).toBe("string");
		expect(ADMIN_ACTION_BUTTON).toContain("rounded-lg");

    // Edit and Delete should extend the base style
    expect(ADMIN_ACTION_EDIT_BUTTON).toContain(ADMIN_ACTION_BUTTON);
    expect(ADMIN_ACTION_DELETE_BUTTON).toContain(ADMIN_ACTION_BUTTON);

    // Delete should have destructive styling
    expect(ADMIN_ACTION_DELETE_BUTTON).toContain("991b1b");
  });
});
