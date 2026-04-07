import { describe, it, expect } from "vitest";
import { formatMoney, calculateDiscount, cn, truncate } from "@/lib/utils";

describe("formatMoney", () => {
  it("should format centavos to BRL", () => {
    expect(formatMoney(19900)).toBe("R$\u00a0199,00");
  });

  it("should handle zero", () => {
    expect(formatMoney(0)).toBe("R$\u00a00,00");
  });

  it("should handle large amounts", () => {
    expect(formatMoney(100000)).toBe("R$\u00a01.000,00");
  });

  it("should handle centavos", () => {
    expect(formatMoney(199)).toBe("R$\u00a01,99");
  });
});

describe("calculateDiscount", () => {
  it("should calculate percentage discount", () => {
    expect(calculateDiscount(20000, 15000)).toBe(25);
  });

  it("should return 0 for zero original price", () => {
    expect(calculateDiscount(0, 100)).toBe(0);
  });

  it("should round the result", () => {
    expect(calculateDiscount(30000, 19900)).toBe(34);
  });
});

describe("cn", () => {
  it("should join class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("should filter falsy values", () => {
    expect(cn("a", false, "b", null, undefined, "c")).toBe("a b c");
  });

  it("should return empty string for all falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

describe("truncate", () => {
  it("should not truncate short strings", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("should truncate long strings", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });

  it("should handle exact length", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});
