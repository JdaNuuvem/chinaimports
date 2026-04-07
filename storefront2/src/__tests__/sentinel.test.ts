import { describe, it, expect, beforeEach, vi } from "vitest";
import { trackEvent, trackAddToCart, trackPurchase, trackSearch, trackLead, trackViewItem } from "@/lib/sentinel";

describe("sentinel tracking", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: {},
      configurable: true,
      writable: true,
    });
  });

  it("queues events when tracker not loaded", () => {
    trackEvent("custom_event", { foo: "bar" });
    const w = globalThis.window as { _sQueue?: Array<{ event: string; data?: Record<string, unknown> }> };
    expect(w._sQueue).toBeDefined();
    expect(w._sQueue?.[0]?.event).toBe("custom_event");
    expect(w._sQueue?.[0]?.data?.foo).toBe("bar");
  });

  it("calls tracker.track when available", () => {
    const trackMock = vi.fn();
    Object.defineProperty(globalThis, "window", {
      value: { sentinel: { track: trackMock } },
      configurable: true,
      writable: true,
    });
    trackEvent("page_view", { url: "/x" });
    expect(trackMock).toHaveBeenCalledWith("page_view", { url: "/x" });
  });

  it("trackAddToCart formats payload with cents → reais", () => {
    const trackMock = vi.fn();
    Object.defineProperty(globalThis, "window", {
      value: { sentinel: { track: trackMock } },
      configurable: true,
      writable: true,
    });
    trackAddToCart({
      variantId: "v_1",
      productId: "p_1",
      title: "Tênis X",
      price: 19900,
      quantity: 2,
    });
    expect(trackMock).toHaveBeenCalledWith("add_to_cart", expect.objectContaining({
      item_id: "p_1",
      variant_id: "v_1",
      item_name: "Tênis X",
      price: 199,
      quantity: 2,
      value: 398,
      currency: "BRL",
    }));
  });

  it("trackPurchase formats payload correctly", () => {
    const trackMock = vi.fn();
    Object.defineProperty(globalThis, "window", {
      value: { sentinel: { track: trackMock } },
      configurable: true,
      writable: true,
    });
    trackPurchase({
      id: "ord_1",
      total: 50000,
      email: "x@y.com",
      items: [{ id: "p_1", title: "X", price: 25000, quantity: 2 }],
    });
    expect(trackMock).toHaveBeenCalledWith("purchase", expect.objectContaining({
      transaction_id: "ord_1",
      value: 500,
      email: "x@y.com",
    }));
  });

  it("trackSearch fires with query", () => {
    const trackMock = vi.fn();
    Object.defineProperty(globalThis, "window", {
      value: { sentinel: { track: trackMock } },
      configurable: true,
      writable: true,
    });
    trackSearch("camiseta", 5);
    expect(trackMock).toHaveBeenCalledWith("search", { search_term: "camiseta", result_count: 5 });
  });

  it("trackLead fires with email + source", () => {
    const trackMock = vi.fn();
    Object.defineProperty(globalThis, "window", {
      value: { sentinel: { track: trackMock } },
      configurable: true,
      writable: true,
    });
    trackLead("a@b.com", "popup");
    expect(trackMock).toHaveBeenCalledWith("lead", { email: "a@b.com", source: "popup" });
  });

  it("trackViewItem converts price to reais", () => {
    const trackMock = vi.fn();
    Object.defineProperty(globalThis, "window", {
      value: { sentinel: { track: trackMock } },
      configurable: true,
      writable: true,
    });
    trackViewItem({ id: "p_1", title: "X", price: 9990 });
    expect(trackMock).toHaveBeenCalledWith("view_item", expect.objectContaining({
      item_id: "p_1",
      price: 99.9,
      currency: "BRL",
    }));
  });
});
