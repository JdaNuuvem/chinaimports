import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { captureError, captureMessage } from "@/lib/error-tracking";

describe("error-tracking", () => {
  let beaconCalls: Array<{ url: string; data: BodyInit | null }> = [];

  beforeEach(() => {
    beaconCalls = [];
    Object.defineProperty(globalThis, "navigator", {
      value: {
        userAgent: "test-agent",
        sendBeacon: vi.fn((url: string, data: BodyInit | null) => {
          beaconCalls.push({ url, data });
          return true;
        }),
      },
      configurable: true,
    });
    Object.defineProperty(globalThis, "window", {
      value: { location: { href: "http://test/x" } },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("captureError sends a beacon", () => {
    captureError(new Error("boom"));
    expect(beaconCalls.length).toBe(1);
    expect(beaconCalls[0].url).toMatch(/\/store\/errors$/);
  });

  it("dedupes the same error within a session", () => {
    const err = new Error("dupe");
    captureError(err);
    captureError(err);
    // First triggers beacon, second is deduped (same fingerprint)
    expect(beaconCalls.length).toBe(1);
  });

  it("captureMessage works with strings", () => {
    captureMessage("a unique custom message");
    expect(beaconCalls.length).toBe(1);
  });

  it("includes message in payload", () => {
    captureError(new Error("with-payload"));
    const blob = beaconCalls[0].data as Blob;
    // Read blob text in a way both jsdom and node support
    return blob.text().then((txt) => {
      expect(txt).toContain("with-payload");
    });
  });
});
