import { describe, it, expect, vi, beforeEach } from "vitest";
import { resilientFetch, getClientStatus } from "@/lib/medusa-client";
import { medusaCircuitBreaker } from "@/lib/circuit-breaker";
import { apiCache } from "@/lib/cache/lru-cache";

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("medusa-client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    medusaCircuitBreaker.reset();
    apiCache.clear();
  });

  it("should return data on successful fetch", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ products: [], count: 0 }),
    });

    const result = await resilientFetch<{ products: []; count: number }>("/store/products");
    expect(result.data).toEqual({ products: [], count: 0 });
    expect(result.source).toBe("api");
    expect(result.degraded).toBe(false);
  });

  it("should set degraded flag when circuit breaker is open", async () => {
    medusaCircuitBreaker.recordFailure();
    medusaCircuitBreaker.recordFailure();
    medusaCircuitBreaker.recordFailure();

    const result = await resilientFetch("/store/test-degraded");
    expect(result.degraded).toBe(true);
    expect(result.source).not.toBe("api");
  });

  it("should handle network errors gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await resilientFetch("/store/unique-error-test");
    expect(result.degraded).toBe(true);
    expect(result.error).toBeTruthy();
  });

  it("should not retry on 4xx errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: "Not found" }),
    });

    const result = await resilientFetch("/store/products/invalid-404");
    expect(result.data).toBeNull();
    expect(result.error).toContain("404");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should return client status", () => {
    const status = getClientStatus();
    expect(status.circuitBreaker).toBeDefined();
    expect(status.circuitBreaker.state).toBe("CLOSED");
    expect(status.cache).toBeDefined();
    expect(status.backendUrl).toBeTruthy();
  });
});
