interface QueuedCartOp {
  action: "add" | "update" | "remove";
  cartId: string;
  variantId?: string;
  itemId?: string;
  quantity?: number;
  timestamp: number;
}

const STORAGE_KEY = "ua_cart_queue";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getQueuedOps(): QueuedCartOp[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const ops: QueuedCartOp[] = JSON.parse(raw);
    const now = Date.now();
    // Filter out expired operations
    return ops.filter((op) => now - op.timestamp < EXPIRY_MS);
  } catch {
    return [];
  }
}

export function enqueueCartOp(op: Omit<QueuedCartOp, "timestamp">): void {
  if (!isBrowser()) return;
  const ops = getQueuedOps();
  ops.push({ ...op, timestamp: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ops));
}

export function dequeueCartOp(index: number): void {
  if (!isBrowser()) return;
  const ops = getQueuedOps();
  ops.splice(index, 1);
  if (ops.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ops));
  }
}

export function clearCartQueue(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasQueuedOps(): boolean {
  return getQueuedOps().length > 0;
}
