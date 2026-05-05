import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className merger)", () => {
  it("merges multiple class strings", () => {
    const result = cn("px-4", "py-2");
    expect(result).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base", isActive && "active");
    expect(result).toContain("active");
  });

  it("removes falsy values", () => {
    const result = cn("base", false, null, undefined, "end");
    expect(result).toBe("base end");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("handles empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("merges array of classes", () => {
    const result = cn(["px-4", "py-2"]);
    expect(result).toBe("px-4 py-2");
  });
});
