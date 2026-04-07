/**
 * Sentinel Tracking helpers — typed wrappers around the global tracker.
 *
 * The CDN script exposes (after load) a global `window.sentinel.track(eventName, payload)`
 * (or similar — exact name may vary; we use a defensive lookup so it works
 * even if the global hasn't loaded yet, queuing events for retry).
 *
 * Standard ecommerce events follow GA4/Meta Pixel naming so the same payload
 * can be forwarded to those networks.
 */

interface SentinelGlobal {
  track?: (event: string, data?: Record<string, unknown>) => void;
  push?: (event: string, data?: Record<string, unknown>) => void;
}

interface WindowWithSentinel extends Window {
  sentinel?: SentinelGlobal;
  _sQueue?: Array<{ event: string; data?: Record<string, unknown> }>;
}

function getSentinel(): SentinelGlobal | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as WindowWithSentinel;
  return w.sentinel || null;
}

/**
 * Track a generic event. If the tracker hasn't loaded yet, the event is
 * queued on `window._sQueue` so the tracker can drain it on load.
 */
export function trackEvent(event: string, data?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const s = getSentinel();
  if (s?.track) { s.track(event, data); return; }
  if (s?.push) { s.push(event, data); return; }
  // Queue for later
  const w = window as unknown as WindowWithSentinel;
  w._sQueue = w._sQueue || [];
  w._sQueue.push({ event, data });
}

// ── Standard ecommerce events ──────────────────────────────

export function trackViewItem(product: {
  id: string;
  title: string;
  price: number;
  currency?: string;
  category?: string;
}) {
  trackEvent("view_item", {
    item_id: product.id,
    item_name: product.title,
    price: product.price / 100,
    currency: product.currency || "BRL",
    category: product.category,
  });
}

export function trackAddToCart(item: {
  variantId: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  currency?: string;
}) {
  trackEvent("add_to_cart", {
    item_id: item.productId,
    variant_id: item.variantId,
    item_name: item.title,
    price: item.price / 100,
    quantity: item.quantity,
    value: (item.price * item.quantity) / 100,
    currency: item.currency || "BRL",
  });
}

export function trackBeginCheckout(cart: {
  id: string;
  total: number;
  items: Array<{ id: string; title: string; price: number; quantity: number }>;
  currency?: string;
}) {
  trackEvent("begin_checkout", {
    cart_id: cart.id,
    value: cart.total / 100,
    currency: cart.currency || "BRL",
    items: cart.items.map((i) => ({
      item_id: i.id,
      item_name: i.title,
      price: i.price / 100,
      quantity: i.quantity,
    })),
  });
}

export function trackPurchase(order: {
  id: string;
  total: number;
  email?: string;
  items: Array<{ id: string; title: string; price: number; quantity: number }>;
  currency?: string;
}) {
  trackEvent("purchase", {
    transaction_id: order.id,
    value: order.total / 100,
    currency: order.currency || "BRL",
    email: order.email,
    items: order.items.map((i) => ({
      item_id: i.id,
      item_name: i.title,
      price: i.price / 100,
      quantity: i.quantity,
    })),
  });
}

export function trackSearch(query: string, resultCount?: number) {
  trackEvent("search", { search_term: query, result_count: resultCount });
}

export function trackLead(email: string, source?: string) {
  trackEvent("lead", { email, source });
}
