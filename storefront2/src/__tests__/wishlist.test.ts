import { describe, it, expect, beforeEach, vi } from "vitest";
import { getWishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist } from "@/lib/wishlist";

const store: Record<string, string> = {};
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: vi.fn((k: string) => store[k] ?? null),
    setItem: vi.fn((k: string, v: string) => { store[k] = v; }),
    removeItem: vi.fn((k: string) => { delete store[k]; }),
    clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
  },
});

// Stub fetch — wishlist now syncs to backend when token present
globalThis.fetch = vi.fn(() => Promise.resolve(new Response(JSON.stringify({}), { status: 200 }))) as unknown as typeof fetch;

describe("wishlist", () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    vi.clearAllMocks();
  });

  it("should return empty array initially", () => {
    expect(getWishlist()).toEqual([]);
  });

  it("should add product to wishlist", () => {
    const list = addToWishlist("prod_1");
    expect(list).toContain("prod_1");
    expect(isInWishlist("prod_1")).toBe(true);
  });

  it("should not duplicate products", () => {
    addToWishlist("prod_1");
    addToWishlist("prod_1");
    expect(getWishlist()).toHaveLength(1);
  });

  it("should remove product from wishlist", () => {
    addToWishlist("prod_1");
    addToWishlist("prod_2");
    removeFromWishlist("prod_1");
    expect(getWishlist()).toEqual(["prod_2"]);
    expect(isInWishlist("prod_1")).toBe(false);
  });

  it("should toggle wishlist", () => {
    const r1 = toggleWishlist("prod_1");
    expect(r1.inWishlist).toBe(true);

    const r2 = toggleWishlist("prod_1");
    expect(r2.inWishlist).toBe(false);
    expect(r2.list).not.toContain("prod_1");
  });
});
