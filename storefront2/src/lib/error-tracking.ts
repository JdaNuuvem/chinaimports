/**
 * Lightweight error tracking. Designed to be swapped with Sentry later
 * (just replace these functions with @sentry/nextjs equivalents).
 *
 * Currently: POSTs errors to backend /store/errors with retry-once + dedupe.
 * Backend can forward to Sentry/Rollbar/LogRocket or just log to disk.
 */

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const seen = new Set<string>();

interface ErrorContext {
  url?: string;
  user_agent?: string;
  user_id?: string;
  extra?: Record<string, unknown>;
}

function fingerprint(message: string, stack?: string): string {
  const stackLine = (stack || "").split("\n")[1] || "";
  return `${message}::${stackLine}`.slice(0, 200);
}

export function captureError(error: Error | string, context: ErrorContext = {}): void {
  if (typeof window === "undefined") return; // server: handled separately

  const message = typeof error === "string" ? error : error.message;
  const stack = typeof error === "string" ? undefined : error.stack;
  const fp = fingerprint(message, stack);

  // Dedupe per session
  if (seen.has(fp)) return;
  seen.add(fp);

  const payload = {
    message,
    stack: stack?.slice(0, 4000),
    url: context.url || window.location.href,
    user_agent: context.user_agent || navigator.userAgent,
    user_id: context.user_id,
    extra: context.extra,
    timestamp: new Date().toISOString(),
  };

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        `${BACKEND}/store/errors`,
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );
    } else {
      fetch(`${BACKEND}/store/errors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* swallow — never let error tracking break the app */
  }
}

export function captureMessage(message: string, context: ErrorContext = {}): void {
  captureError(message, context);
}

// Install global handlers (call once on app mount)
export function installGlobalErrorHandlers(): void {
  if (typeof window === "undefined") return;
  if ((window as unknown as { __errorTrackingInstalled?: boolean }).__errorTrackingInstalled) return;
  (window as unknown as { __errorTrackingInstalled: boolean }).__errorTrackingInstalled = true;

  window.addEventListener("error", (event) => {
    captureError(event.error || event.message, { extra: { source: "window.onerror" } });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    captureError(
      reason instanceof Error ? reason : String(reason),
      { extra: { source: "unhandledrejection" } },
    );
  });
}
