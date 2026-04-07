const STORAGE_KEY = "ua_wishlist";
const TOKEN_KEY = "customer_token"; // matches AUTH_TOKEN_KEY in medusa-client.ts
const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

function readLocal(): string[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(list: string[]) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Fire-and-forget backend sync — best-effort, falls back silently
async function syncToBackend(method: "POST" | "DELETE", productId: string) {
  const token = getToken();
  if (!token) return;
  try {
    const url = method === "POST"
      ? `${BACKEND}/store/customers/me/wishlist`
      : `${BACKEND}/store/customers/me/wishlist/${encodeURIComponent(productId)}`;
    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: method === "POST" ? JSON.stringify({ product_id: productId }) : undefined,
    });
  } catch {
    /* offline / unauth — local copy still updated */
  }
}

// On login, merge local wishlist into backend
export async function mergeWishlistOnLogin(): Promise<void> {
  const token = getToken();
  if (!token) return;
  const local = readLocal();
  try {
    const res = await fetch(`${BACKEND}/store/customers/me/wishlist/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_ids: local }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.wishlist)) writeLocal(data.wishlist);
    }
  } catch { /* ignore */ }
}

// On app load (when logged in), pull authoritative list from backend
export async function loadWishlistFromBackend(): Promise<void> {
  const token = getToken();
  if (!token) return;
  try {
    const res = await fetch(`${BACKEND}/store/customers/me/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.wishlist)) writeLocal(data.wishlist);
    }
  } catch { /* ignore */ }
}

export function getWishlist(): string[] {
  return readLocal();
}

export function addToWishlist(productId: string): string[] {
  const list = readLocal();
  if (!list.includes(productId)) {
    list.push(productId);
    writeLocal(list);
    void syncToBackend("POST", productId);
  }
  return list;
}

export function removeFromWishlist(productId: string): string[] {
  const list = readLocal().filter((id) => id !== productId);
  writeLocal(list);
  void syncToBackend("DELETE", productId);
  return list;
}

export function isInWishlist(productId: string): boolean {
  return readLocal().includes(productId);
}

export function toggleWishlist(productId: string): { inWishlist: boolean; list: string[] } {
  if (isInWishlist(productId)) {
    return { inWishlist: false, list: removeFromWishlist(productId) };
  }
  return { inWishlist: true, list: addToWishlist(productId) };
}
