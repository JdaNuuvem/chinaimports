const STORAGE_KEY = "ua_recently_viewed";
const MAX_ITEMS = 12;

interface RecentProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getRecentlyViewed(): RecentProduct[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToRecentlyViewed(product: RecentProduct): void {
  if (!isBrowser()) return;
  const list = getRecentlyViewed().filter((p) => p.id !== product.id);
  list.unshift(product);
  if (list.length > MAX_ITEMS) list.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
