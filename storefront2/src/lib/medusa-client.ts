import { apiCache } from "./cache/lru-cache";
import { medusaCircuitBreaker } from "./circuit-breaker";

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const FETCH_TIMEOUT_MS = 5000;
const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 1;

export interface FetchResult<T> {
  data: T | null;
  source: "api" | "cache" | "stale-cache" | "fallback";
  degraded: boolean;
  error?: string;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

function isServerError(status: number): boolean {
  return status >= 500 && status < 600;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function resilientFetch<T>(
  endpoint: string,
  options: RequestInit & { revalidate?: number | false } = {}
): Promise<FetchResult<T>> {
  const cacheKey = `${options.method || "GET"}:${endpoint}`;
  const { revalidate, ...fetchOptions } = options;

  // 1. Check circuit breaker
  if (!medusaCircuitBreaker.allowRequest) {
    // Circuit is OPEN — go straight to cache
    const cached = apiCache.get(cacheKey) as T | null;
    if (cached) {
      return { data: cached, source: "cache", degraded: true };
    }
    const stale = apiCache.getStale(cacheKey) as T | null;
    if (stale) {
      return { data: stale, source: "stale-cache", degraded: true };
    }
    return {
      data: null,
      source: "fallback",
      degraded: true,
      error: "Serviço temporariamente indisponível",
    };
  }

  // 2. Try fetch with timeout and retry
  const url = `${MEDUSA_BACKEND_URL}${endpoint}`;
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await sleep(RETRY_DELAY_MS * attempt);
      }

      const nextOptions: RequestInit & { next?: { revalidate?: number | false } } = {
        ...fetchOptions,
      };

      // Add Next.js revalidation for server-side fetches
      if (revalidate !== undefined) {
        nextOptions.next = { revalidate };
      }

      const response = await fetchWithTimeout(url, nextOptions);

      if (response.ok) {
        const data = (await response.json()) as T;
        medusaCircuitBreaker.recordSuccess();
        apiCache.set(cacheKey, data);
        return { data, source: "api", degraded: false };
      }

      if (isServerError(response.status)) {
        lastError = `Medusa API error: ${response.status}`;
        medusaCircuitBreaker.recordFailure();
        continue; // retry on 5xx
      }

      // 4xx errors — don't retry, don't trip circuit breaker
      lastError = `Medusa API error: ${response.status}`;
      return { data: null, source: "api", degraded: false, error: lastError };
    } catch (err) {
      lastError =
        err instanceof Error ? err.message : "Erro de conexão desconhecido";
      medusaCircuitBreaker.recordFailure();
      continue; // retry on network error
    }
  }

  // 3. All retries failed — try caches
  const cached = apiCache.get(cacheKey) as T | null;
  if (cached) {
    return { data: cached, source: "cache", degraded: true, error: lastError };
  }

  const stale = apiCache.getStale(cacheKey) as T | null;
  if (stale) {
    return {
      data: stale,
      source: "stale-cache",
      degraded: true,
      error: lastError,
    };
  }

  return { data: null, source: "fallback", degraded: true, error: lastError };
}

// ──────────────────────────────────────────────
// Typed API functions (Server-side, with ISR)
// ──────────────────────────────────────────────

import type {
  Product,
  ProductVariant,
  ProductOption,
  Collection,
  Cart,
  CartItem,
} from "./medusa";

export type { Product, ProductVariant, ProductOption, Collection, Cart, CartItem };

export async function getProducts(limit = 20, offset = 0) {
  return resilientFetch<{ products: Product[]; count: number }>(
    `/store/products?limit=${limit}&offset=${offset}`,
    { revalidate: 120 }
  );
}

export async function getProduct(handle: string) {
  return resilientFetch<{ products: Product[] }>(
    `/store/products?handle=${handle}`,
    { revalidate: 300 }
  );
}

export async function getCollections() {
  return resilientFetch<{ collections: Collection[] }>("/store/collections", {
    revalidate: 300,
  });
}

export async function getCollection(handle: string) {
  return resilientFetch<{ collections: Collection[] }>(
    `/store/collections?handle=${handle}`,
    { revalidate: 120 }
  );
}

export async function getProductsByCollection(
  collectionId: string,
  limit = 20,
  offset = 0
) {
  return resilientFetch<{ products: Product[]; count: number }>(
    `/store/products?collection_id=${collectionId}&limit=${limit}&offset=${offset}`,
    { revalidate: 120 }
  );
}

export async function searchProducts(query: string) {
  return resilientFetch<{ hits: Product[] }>("/store/products/search", {
    method: "POST",
    body: JSON.stringify({ q: query }),
  });
}

// ──────────────────────────────────────────────
// Cart functions (Client-side, no ISR)
// ──────────────────────────────────────────────

export async function createCart() {
  // Send customer token if logged in so backend can attach email + customerId
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return resilientFetch<{ cart: Cart }>("/store/carts", { method: "POST", headers });
}

export async function getCart(cartId: string) {
  return resilientFetch<{ cart: Cart }>(`/store/carts/${cartId}`);
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number
) {
  return resilientFetch<{ cart: Cart }>(`/store/carts/${cartId}/line-items`, {
    method: "POST",
    body: JSON.stringify({ variant_id: variantId, quantity }),
  });
}

export async function updateCartItem(
  cartId: string,
  itemId: string,
  quantity: number
) {
  return resilientFetch<{ cart: Cart }>(
    `/store/carts/${cartId}/line-items/${itemId}`,
    { method: "POST", body: JSON.stringify({ quantity }) }
  );
}

export async function removeFromCart(cartId: string, itemId: string) {
  return resilientFetch<{ cart: Cart }>(
    `/store/carts/${cartId}/line-items/${itemId}`,
    { method: "DELETE" }
  );
}

// ──────────────────────────────────────────────
// Checkout functions
// ──────────────────────────────────────────────

export async function updateCartAddress(
  cartId: string,
  address: Record<string, string>
) {
  return resilientFetch<{ cart: Cart }>(`/store/carts/${cartId}`, {
    method: "POST",
    body: JSON.stringify({ shipping_address: address, billing_address: address }),
  });
}

export async function getShippingOptions(cartId: string) {
  return resilientFetch<{ shipping_options: Array<{ id: string; name: string; amount: number }> }>(
    `/store/shipping-options/${cartId}`
  );
}

export async function selectShippingMethod(
  cartId: string,
  optionId: string
) {
  return resilientFetch<{ cart: Cart }>(
    `/store/carts/${cartId}/shipping-methods`,
    { method: "POST", body: JSON.stringify({ option_id: optionId }) }
  );
}

export async function createPaymentSessions(cartId: string) {
  return resilientFetch<{ cart: Cart }>(
    `/store/carts/${cartId}/payment-sessions`,
    { method: "POST" }
  );
}

export async function completeCart(cartId: string) {
  return resilientFetch<{ type: string; data: Record<string, unknown> }>(
    `/store/carts/${cartId}/complete`,
    { method: "POST" }
  );
}

// ──────────────────────────────────────────────
// Newsletter & Contact
// ──────────────────────────────────────────────

export async function subscribeNewsletter(email: string) {
  return resilientFetch<{ success: boolean }>("/store/newsletter", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function submitContactForm(data: {
  name: string;
  email: string;
  message: string;
}) {
  return resilientFetch<{ success: boolean }>("/store/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ──────────────────────────────────────────────
// Customer / Auth functions
// ──────────────────────────────────────────────

export const AUTH_TOKEN_KEY = "customer_token";
export const AUTH_FLAG_KEY = "customer_authenticated";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function registerCustomer(data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}) {
  return resilientFetch<{ customer: Record<string, unknown>; token: string }>(
    "/store/customers",
    { method: "POST", body: JSON.stringify(data) }
  );
}

export async function loginCustomer(email: string, password: string) {
  return resilientFetch<{ customer: Record<string, unknown>; token: string }>(
    "/store/auth",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
}

export async function logoutCustomer() {
  const result = await resilientFetch<{ success: boolean }>(
    "/store/auth/logout",
    { method: "POST", headers: getAuthHeaders() }
  );
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_FLAG_KEY);
    // Clear customer-specific local data so next user doesn't inherit it
    localStorage.removeItem("ua_wishlist");
    localStorage.removeItem("recent_searches");
  }
  return result;
}

export async function getCustomer() {
  return resilientFetch<{ customer: Record<string, unknown> }>(
    "/store/customers/me",
    { headers: getAuthHeaders() }
  );
}

export async function getCustomerOrders() {
  return resilientFetch<{ orders: Array<Record<string, unknown>>; count: number }>(
    "/store/customers/me/orders",
    { headers: getAuthHeaders() }
  );
}

// ──────────────────────────────────────────────
// Diagnostics
// ──────────────────────────────────────────────

export function getClientStatus() {
  return {
    circuitBreaker: medusaCircuitBreaker.status(),
    cache: apiCache.stats(),
    backendUrl: MEDUSA_BACKEND_URL,
  };
}
