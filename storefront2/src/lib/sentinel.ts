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

/**
 * Fired when a list of products is rendered (collection page, search results,
 * "you might also like" carousels). Helps Sentinel attribute product views to
 * the place that surfaced them.
 */
export function trackViewItemList(listName: string, items: Array<{ id: string; title: string; price: number }>) {
  trackEvent("view_item_list", {
    item_list_name: listName,
    items: items.slice(0, 30).map((i) => ({
      item_id: i.id,
      item_name: i.title,
      price: i.price / 100,
    })),
  });
}

/** Fired when a user clicks a product in a list to open its detail page. */
export function trackSelectItem(listName: string, item: { id: string; title: string; price: number }) {
  trackEvent("select_item", {
    item_list_name: listName,
    item_id: item.id,
    item_name: item.title,
    price: item.price / 100,
  });
}

/** Fired when a line is removed from the cart. */
export function trackRemoveFromCart(item: {
  variantId: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
}) {
  trackEvent("remove_from_cart", {
    item_id: item.productId,
    variant_id: item.variantId,
    item_name: item.title,
    price: item.price / 100,
    quantity: item.quantity,
    value: (item.price * item.quantity) / 100,
    currency: "BRL",
  });
}

/** Fired when the user reaches the payment step in the local checkout. */
export function trackAddPaymentInfo(payload: {
  cart_id: string;
  value: number;
  payment_method?: string;
}) {
  trackEvent("add_payment_info", {
    cart_id: payload.cart_id,
    value: payload.value / 100,
    currency: "BRL",
    payment_method: payload.payment_method,
  });
}

/** Fired when the user confirms a shipping address in the local checkout. */
export function trackAddShippingInfo(payload: {
  cart_id: string;
  value: number;
  shipping_tier?: string;
}) {
  trackEvent("add_shipping_info", {
    cart_id: payload.cart_id,
    value: payload.value / 100,
    currency: "BRL",
    shipping_tier: payload.shipping_tier,
  });
}
