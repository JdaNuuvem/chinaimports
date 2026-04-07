import { describe, it, expect, beforeEach, vi } from "vitest";
import { getRecentlyViewed, addToRecentlyViewed } from "@/lib/recently-viewed";

const store: Record<string, string> = {};
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: vi.fn((k: string) => store[k] ?? null),
    setItem: vi.fn((k: string, v: string) => { store[k] = v; }),
    removeItem: vi.fn((k: string) => { delete store[k]; }),
    clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
  },
});

describe("recently-viewed", () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
  });

  it("should return empty array initially", () => {
    expect(getRecentlyViewed()).toEqual([]);
  });

  it("should add product to recently viewed", () => {
    addToRecentlyViewed({ id: "p1", title: "Product 1", handle: "p1", thumbnail: null, price: 100 });
    expect(getRecentlyViewed()).toHaveLength(1);
    expect(getRecentlyViewed()[0].id).toBe("p1");
  });

  it("should put newest first", () => {
    addToRecentlyViewed({ id: "p1", title: "Product 1", handle: "p1", thumbnail: null, price: 100 });
    addToRecentlyViewed({ id: "p2", title: "Product 2", handle: "p2", thumbnail: null, price: 200 });
    expect(getRecentlyViewed()[0].id).toBe("p2");
  });

  it("should not duplicate products", () => {
    addToRecentlyViewed({ id: "p1", title: "Product 1", handle: "p1", thumbnail: null, price: 100 });
    addToRecentlyViewed({ id: "p1", title: "Product 1 Updated", handle: "p1", thumbnail: null, price: 150 });
    expect(getRecentlyViewed()).toHaveLength(1);
    expect(getRecentlyViewed()[0].title).toBe("Product 1 Updated");
  });

  it("should limit to 12 items", () => {
    for (let i = 0; i < 15; i++) {
      addToRecentlyViewed({ id: `p${i}`, title: `Product ${i}`, handle: `p${i}`, thumbnail: null, price: i * 100 });
    }
    expect(getRecentlyViewed()).toHaveLength(12);
    expect(getRecentlyViewed()[0].id).toBe("p14"); // most recent
  });
});
