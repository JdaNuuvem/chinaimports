import { describe, it, expect, beforeEach, vi } from "vitest";
import { getQueuedOps, enqueueCartOp, dequeueCartOp, clearCartQueue, hasQueuedOps } from "@/lib/cart-queue";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("cart-queue", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("should return empty array when no ops queued", () => {
    expect(getQueuedOps()).toEqual([]);
  });

  it("should enqueue and retrieve operations", () => {
    enqueueCartOp({ action: "add", cartId: "cart1", variantId: "var1", quantity: 2 });
    const ops = getQueuedOps();
    expect(ops).toHaveLength(1);
    expect(ops[0].action).toBe("add");
    expect(ops[0].variantId).toBe("var1");
    expect(ops[0].quantity).toBe(2);
  });

  it("should dequeue an operation by index", () => {
    enqueueCartOp({ action: "add", cartId: "cart1", variantId: "var1" });
    enqueueCartOp({ action: "remove", cartId: "cart1", itemId: "item1" });
    dequeueCartOp(0);
    const ops = getQueuedOps();
    expect(ops).toHaveLength(1);
    expect(ops[0].action).toBe("remove");
  });

  it("should clear all queued operations", () => {
    enqueueCartOp({ action: "add", cartId: "cart1", variantId: "var1" });
    enqueueCartOp({ action: "add", cartId: "cart1", variantId: "var2" });
    clearCartQueue();
    expect(getQueuedOps()).toEqual([]);
  });

  it("should report hasQueuedOps correctly", () => {
    expect(hasQueuedOps()).toBe(false);
    enqueueCartOp({ action: "add", cartId: "cart1", variantId: "var1" });
    expect(hasQueuedOps()).toBe(true);
  });

  it("should remove storage key when last op is dequeued", () => {
    enqueueCartOp({ action: "add", cartId: "cart1", variantId: "var1" });
    dequeueCartOp(0);
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});
