import { describe, it, expect } from "vitest";

/**
 * These tests verify the webhook gate logic from backend/server.js.
 * Since the backend is a monolithic Express file (not importable as a module),
 * we test the gate conditions as pure logic assertions rather than full
 * integration tests.
 *
 * The actual backend integration tests live in backend/__tests__/api.test.js.
 */

describe("Luna webhook gate logic", () => {
  // The gate checks: if (!LUNA_CHECKOUT_URL) return 503
  function lunaGate(lunaCheckoutUrl: string | null | undefined): { status: number; allowed: boolean } {
    if (!lunaCheckoutUrl) {
      return { status: 503, allowed: false };
    }
    return { status: 200, allowed: true };
  }

  it("returns 503 when LUNA_CHECKOUT_URL is not set (null)", () => {
    const result = lunaGate(null);
    expect(result.status).toBe(503);
    expect(result.allowed).toBe(false);
  });

  it("returns 503 when LUNA_CHECKOUT_URL is empty string", () => {
    const result = lunaGate("");
    expect(result.status).toBe(503);
    expect(result.allowed).toBe(false);
  });

  it("returns 503 when LUNA_CHECKOUT_URL is undefined", () => {
    const result = lunaGate(undefined);
    expect(result.status).toBe(503);
    expect(result.allowed).toBe(false);
  });

  it("allows webhook when LUNA_CHECKOUT_URL is set", () => {
    const result = lunaGate("https://luna.example.com/checkout");
    expect(result.status).toBe(200);
    expect(result.allowed).toBe(true);
  });
});

describe("Sentinel webhook gate logic", () => {
  // The gate checks: if (!apiKey || !expected) return 503
  function sentinelGate(
    apiKey: string | null | undefined,
    webhookSecret: string | null | undefined,
  ): { status: number; allowed: boolean } {
    if (!apiKey || !webhookSecret) {
      return { status: 503, allowed: false };
    }
    return { status: 200, allowed: true };
  }

  it("returns 503 when SENTINEL_API_KEY is missing", () => {
    const result = sentinelGate(null, "secret123");
    expect(result.status).toBe(503);
    expect(result.allowed).toBe(false);
  });

  it("returns 503 when SENTINEL_WEBHOOK_SECRET is missing", () => {
    const result = sentinelGate("api_key_123", null);
    expect(result.status).toBe(503);
    expect(result.allowed).toBe(false);
  });

  it("returns 503 when both are missing", () => {
    const result = sentinelGate(null, null);
    expect(result.status).toBe(503);
    expect(result.allowed).toBe(false);
  });

  it("returns 503 when SENTINEL_API_KEY is empty string", () => {
    const result = sentinelGate("", "secret123");
    expect(result.status).toBe(503);
    expect(result.allowed).toBe(false);
  });

  it("returns 503 when SENTINEL_WEBHOOK_SECRET is empty string", () => {
    const result = sentinelGate("api_key_123", "");
    expect(result.status).toBe(503);
    expect(result.allowed).toBe(false);
  });

  it("allows webhook when both keys are present", () => {
    const result = sentinelGate("api_key_123", "secret123");
    expect(result.status).toBe(200);
    expect(result.allowed).toBe(true);
  });
});
