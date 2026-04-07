import { describe, it, expect } from "vitest";
import { formatMoney, calculateDiscount } from "@/lib/utils";

describe("formatMoney (extended)", () => {
  it("should format BRL by default", () => {
    const result = formatMoney(19900);
    expect(result).toContain("199");
    expect(result).toContain("00");
  });

  it("should handle USD currency", () => {
    const result = formatMoney(19900, "USD");
    expect(result).toContain("199");
  });

  it("should handle EUR currency", () => {
    const result = formatMoney(19900, "EUR");
    expect(result).toContain("199");
  });

  it("should handle single centavo", () => {
    const result = formatMoney(1);
    expect(result).toContain("0,01");
  });

  it("should handle negative amounts", () => {
    const result = formatMoney(-5000);
    expect(result).toContain("50");
  });

  it("should handle very large amounts", () => {
    const result = formatMoney(99999900);
    expect(result).toContain("999.999");
  });
});

describe("calculateDiscount (extended)", () => {
  it("should calculate 50% discount", () => {
    expect(calculateDiscount(20000, 10000)).toBe(50);
  });

  it("should calculate 0% when same price", () => {
    expect(calculateDiscount(10000, 10000)).toBe(0);
  });

  it("should handle 100% discount", () => {
    expect(calculateDiscount(10000, 0)).toBe(100);
  });

  it("should handle negative original price", () => {
    expect(calculateDiscount(-100, 50)).toBe(0);
  });
});
