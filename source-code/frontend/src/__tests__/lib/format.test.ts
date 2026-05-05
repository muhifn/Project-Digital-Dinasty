import { describe, it, expect } from "vitest";
import { formatCurrency, formatStock } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats a number to IDR currency", () => {
    const result = formatCurrency(15000);
    // IDR format: "Rp 15.000" (Indonesian locale)
    expect(result).toContain("15");
    expect(result).toContain("Rp");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("Rp");
    expect(result).toContain("0");
  });

  it("formats large numbers", () => {
    const result = formatCurrency(1500000);
    expect(result).toContain("Rp");
    expect(result).toContain("1.500.000");
  });

  it("formats string numbers", () => {
    const result = formatCurrency("25000");
    expect(result).toContain("25");
  });

  it('returns "Rp 0" for NaN input', () => {
    const result = formatCurrency("not-a-number");
    expect(result).toBe("Rp 0");
  });

  it('returns "Rp 0" for NaN numeric input', () => {
    const result = formatCurrency(NaN);
    expect(result).toBe("Rp 0");
  });

  it("formats decimal values", () => {
    const result = formatCurrency(15500.5);
    expect(result).toContain("Rp");
  });
});

describe("formatStock", () => {
  it("formats stock with unit", () => {
    expect(formatStock(10, "kg")).toBe("10 kg");
  });

  it("formats zero stock", () => {
    expect(formatStock(0, "pcs")).toBe("0 pcs");
  });

  it("formats large stock numbers", () => {
    expect(formatStock(999, "pack")).toBe("999 pack");
  });
});
