const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export async function medusaFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${MEDUSA_BACKEND_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Medusa API error: ${response.status}`);
  }
  return response.json();
}

// Product types
export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  thumbnail: string | null;
  images: { id: string; url: string }[];
  variants: ProductVariant[];
  options: ProductOption[];
  tags: { id: string; value: string }[];
  collection_id: string | null;
  collection: { id: string; title: string; handle: string } | null;
  luna_checkout_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  prices: { amount: number; currency_code: string }[];
  sku: string | null;
  inventory_quantity: number;
  options: { id: string; value: string }[];
  original_price: number | null;
  calculated_price: number | null;
}

export interface ProductOption {
  id: string;
  title: string;
  values: { id: string; value: string }[];
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  imageUrl?: string | null;
  productCount?: number;
  products?: Product[];
}

export interface CartItem {
  id: string;
  title: string;
  quantity: number;
  variant: ProductVariant;
  thumbnail: string | null;
  unit_price: number;
  total: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  region_id: string;
  email?: string | null;
}

// API functions
export async function getProducts(limit = 20, offset = 0) {
  return medusaFetch<{ products: Product[]; count: number }>(
    `/store/products?limit=${limit}&offset=${offset}`
  );
}

export async function getProduct(handle: string) {
  return medusaFetch<{ products: Product[] }>(
    `/store/products?handle=${handle}`
  );
}

export async function getCollections() {
  return medusaFetch<{ collections: Collection[] }>("/store/collections");
}

export async function getCollection(handle: string) {
  return medusaFetch<{ collections: Collection[] }>(
    `/store/collections?handle=${handle}`
  );
}

export async function searchProducts(query: string) {
  return medusaFetch<{ hits: Product[] }>("/store/products/search", {
    method: "POST",
    body: JSON.stringify({ q: query }),
  });
}

export async function createCart() {
  return medusaFetch<{ cart: Cart }>("/store/carts", { method: "POST" });
}

export async function getCart(cartId: string) {
  return medusaFetch<{ cart: Cart }>(`/store/carts/${cartId}`);
}

export async function addToCart(cartId: string, variantId: string, quantity: number) {
  return medusaFetch<{ cart: Cart }>(`/store/carts/${cartId}/line-items`, {
    method: "POST",
    body: JSON.stringify({ variant_id: variantId, quantity }),
  });
}

export async function updateCartItem(cartId: string, itemId: string, quantity: number) {
  return medusaFetch<{ cart: Cart }>(`/store/carts/${cartId}/line-items/${itemId}`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(cartId: string, itemId: string) {
  return medusaFetch<{ cart: Cart }>(`/store/carts/${cartId}/line-items/${itemId}`, {
    method: "DELETE",
  });
}
