import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SentinelTracker, { buildSentinelConfigScript, SENTINEL_TRACKER_SRC } from "@/components/SentinelTracker";

describe("buildSentinelConfigScript", () => {
  it("embeds api key as JSON string", () => {
    const script = buildSentinelConfigScript("sk_test_123");
    expect(script).toContain('"sk_test_123"');
    expect(script).toContain("_sCfg");
    expect(script).toContain("api_key:");
  });

  it("escapes quotes in api key", () => {
    const script = buildSentinelConfigScript('sk_w"ird');
    // JSON.stringify converts " to \"
    expect(script).toContain('sk_w\\"ird');
  });

  it("references all required globals", () => {
    const script = buildSentinelConfigScript("sk_x");
    expect(script).toContain("__sentinel_landing");
    expect(script).toContain("_sCfg");
    expect(script).toContain("localStorage.getItem(\"s_a\")");
  });

  it("includes all UTM param names", () => {
    const script = buildSentinelConfigScript("sk_x");
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "click_id", "pixel_id"].forEach((p) => {
      expect(script).toContain(p);
    });
  });

  it("is wrapped in IIFE", () => {
    const script = buildSentinelConfigScript("sk_x");
    expect(script).toMatch(/^\(function\(\)\{/);
    expect(script).toMatch(/\}\)\(\)$/);
  });

  it("skips UTM restoration when URL already has utm_*", () => {
    // Test the regex logic inline
    const script = buildSentinelConfigScript("sk_x");
    expect(script).toContain("!/[?&]utm_/.test(s)");
  });
});

describe("SENTINEL_TRACKER_SRC", () => {
  it("points to the official CDN", () => {
    expect(SENTINEL_TRACKER_SRC).toBe("https://cdn.sentineltracking.io/latest/tracker.js");
  });
});

describe("SentinelTracker component", () => {
  it("renders nothing when apiKey is missing", () => {
    const { container } = render(<SentinelTracker />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when apiKey is empty string", () => {
    const { container } = render(<SentinelTracker apiKey="" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders something (non-null) when apiKey is provided", () => {
    // Note: next/script components render differently in jsdom vs SSR,
    // so we can't rely on innerHTML. We verify the component doesn't return null.
    const result = SentinelTracker({ apiKey: "sk_x", nonce: "n" });
    expect(result).not.toBeNull();
  });
});
