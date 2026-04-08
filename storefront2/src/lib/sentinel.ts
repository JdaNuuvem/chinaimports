/**
 * Sentinel Tracking helpers — thin wrappers around the global SDK loaded
 * by <SentinelTracker />. The SDK exposes Sentinel.init, Sentinel.track
 * and Sentinel.redirectWithTracking per the official docs at
 * https://docs.sentineltracking.io/docs/configuracao
 *
 * Event names follow the Sentinel spec (NOT GA4):
 *   - page_view
 *   - add_to_cart
 *   - init_checkout   (only for INTERNAL checkout)
 *   - purchase        (only for INTERNAL checkout)
 *
 * When the store uses an external gateway (Luna), init_checkout and
 * purchase must NOT be sent from the client — the gateway or its webhook
 * is responsible for marking the conversion. Use redirectWithTracking()
 * instead so the visitor_id is preserved on the outbound URL.
 */

interface SentinelSDK {
  init?: (config: { api_key: string }) => void;
  track?: (event: string, data?: Record<string, unknown>) => void;
  redirectWithTracking?: (url: string) => void;
}

interface WindowWithSentinel extends Window {
  Sentinel?: SentinelSDK;
  _sQueue?: Array<{ event: string; data?: Record<string, unknown> }>;
}

function getSDK(): SentinelSDK | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as WindowWithSentinel).Sentinel || null;
}

/**
 * The only event names Sentinel's API recognizes. Anything else is
 * rejected or becomes noise in the funnel. Source:
 * https://docs.sentineltracking.io/docs/configuracao/dados-dos-eventos
 */
const ALLOWED_EVENTS = new Set([
  "page_view",
  "add_to_cart",
  "init_checkout",
  "purchase",
  "lead",
]);

/**
 * Core helper. Calls Sentinel.track when available, otherwise queues the
 * event on window._sQueue so a late-loading SDK can drain it.
 */
export function trackEvent(event: string, data?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  if (!ALLOWED_EVENTS.has(event)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[Sentinel] ignoring unknown event '${event}' — must be one of ${Array.from(ALLOWED_EVENTS).join(", ")}`);
    }
    return;
  }

  const sdk = getSDK();
  if (sdk?.track) {
    try {
      sdk.track(event, data || {});
      return;
    } catch (e) {
      console.warn("[Sentinel.track]", e);
    }
  }
  const w = window as unknown as WindowWithSentinel;
  w._sQueue = w._sQueue || [];
  w._sQueue.push({ event, data });
}

/**
 * Drop-in replacement for window.location.href = url when redirecting
 * to an external gateway (Luna, WashPay, etc.). Uses the SDK's
 * redirectWithTracking helper to append visitor_id + UTM to the URL so
 * the gateway can attribute the conversion back to the original click.
 * Falls back to a plain navigation if the SDK isn't loaded.
 */
export function redirectWithTracking(url: string): void {
  if (typeof window === "undefined") return;
  const sdk = getSDK();
  if (sdk?.redirectWithTracking) {
    try {
      sdk.redirectWithTracking(url);
      return;
    } catch (e) {
      console.warn("[Sentinel.redirectWithTracking]", e);
    }
  }
  window.location.href = url;
}

// ── High-level helpers — match the event names expected by Sentinel ──

type CartItem = {
  id?: string;
  productId?: string;
  variantId?: string;
  title: string;
  price: number; // centavos (divided by 100 before sending)
  quantity: number;
};

function toSentinelItems(items: CartItem[]) {
  return items.map((i) => ({
    id: i.id || i.productId || i.variantId,
    name: i.title,
    price: (i.price ?? 0) / 100,
    quantity: i.quantity ?? 1,
  }));
}

/**
 * PDP view. Sentinel's spec recommends sending `items` on product detail
 * pages to describe the product in focus.
 */
export function trackViewItem(product: {
  id: string;
  title: string;
  price: number; // centavos
  currency?: string;
}) {
  trackEvent("page_view", {
    items: [
      {
        id: product.id,
        name: product.title,
        price: (product.price ?? 0) / 100,
        quantity: 1,
      },
    ],
    currency: product.currency || "BRL",
  });
}

/**
 * Listing page view (home, collection, search). Sends a plain page_view
 * without items per Sentinel's recommendation for navigation pages.
 */
export function trackViewItemList(_listName: string, _items: Array<{ id: string; title: string; price: number }>) {
  trackEvent("page_view", {});
}

/** No-op — Sentinel doesn't have a separate select_item event; attribution uses visitor_id. */
export function trackSelectItem(_listName: string, _item: { id: string; title: string; price: number }) {
  // intentionally empty
}

export function trackAddToCart(item: {
  variantId: string;
  productId: string;
  title: string;
  price: number; // centavos
  quantity: number;
  currency?: string;
}) {
  trackEvent("add_to_cart", {
    value: (item.price * item.quantity) / 100,
    currency: item.currency || "BRL",
    items: toSentinelItems([item]),
  });
}

/** Sentinel doesn't track remove_from_cart. No-op. */
export function trackRemoveFromCart(_item: unknown) {
  // intentionally empty
}

/**
 * Fire init_checkout. MUST only be called for INTERNAL checkout. When
 * the store uses an external gateway (Luna), this event is dropped —
 * use redirectWithTracking() instead and let the gateway's webhook
 * mark the conversion.
 */
export function trackBeginCheckout(cart: {
  id: string;
  total: number; // centavos
  items: Array<{ id: string; title: string; price: number; quantity: number }>;
  currency?: string;
}, opts?: { internal?: boolean }) {
  // Default to internal=false (safer). Callers that actually run a local
  // checkout must pass { internal: true } explicitly.
  if (!opts?.internal) return;
  trackEvent("init_checkout", {
    value: (cart.total ?? 0) / 100,
    currency: cart.currency || "BRL",
    order_id: cart.id,
    items: toSentinelItems(cart.items as CartItem[]),
  });
}

/**
 * Fire purchase. MUST only be called for INTERNAL checkout. External
 * gateways (Luna) are marked via webhook from the backend.
 */
export function trackPurchase(order: {
  id: string;
  total: number; // centavos
  email?: string;
  items: Array<{ id: string; title: string; price: number; quantity: number }>;
  currency?: string;
}, opts?: { internal?: boolean }) {
  if (!opts?.internal) return;
  trackEvent("purchase", {
    value: (order.total ?? 0) / 100,
    currency: order.currency || "BRL",
    order_id: order.id,
    items: toSentinelItems(order.items as CartItem[]),
    customer: order.email ? { email: order.email } : undefined,
  });
}

/** Sentinel doesn't have a dedicated search event. Send as page_view. */
export function trackSearch(query: string, _resultCount?: number) {
  trackEvent("page_view", { path: `/search?q=${encodeURIComponent(query)}` });
}

/** Lead capture — useful for newsletter / exit-intent popups. */
export function trackLead(email: string, source?: string) {
  trackEvent("lead", { email, source });
}

export function trackAddPaymentInfo(_payload: unknown) {
  // no-op: not in Sentinel spec
}
export function trackAddShippingInfo(_payload: unknown) {
  // no-op: not in Sentinel spec
}
