/**
 * Public Config — settings that the admin can edit at runtime and that
 * the storefront reads at SSR time (cached per request).
 *
 * Source of truth: backend `/store/public-config` endpoint.
 * Fallback: `process.env.NEXT_PUBLIC_*` (for bootstrap / when DB unavailable).
 */

export interface PublicConfig {
  SENTINEL_API_KEY?: string;
  GA_ID?: string;
  FB_PIXEL_ID?: string;
  WHATSAPP_NUMBER?: string;
  STORE_NAME?: string;
}

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

/**
 * Fetch public config from backend. Called once per RSC render.
 * Next.js `fetch` automatically dedupes + caches with revalidate.
 */
export async function getPublicConfig(): Promise<PublicConfig> {
  try {
    const res = await fetch(`${BACKEND}/store/public-config`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const remote = (await res.json()) as PublicConfig;
    return mergeWithEnv(remote);
  } catch {
    return mergeWithEnv({});
  }
}

/** Merge remote config with env fallbacks. Remote wins when both present. */
function mergeWithEnv(remote: PublicConfig): PublicConfig {
  return {
    SENTINEL_API_KEY: remote.SENTINEL_API_KEY || process.env.NEXT_PUBLIC_SENTINEL_API_KEY,
    GA_ID: remote.GA_ID || process.env.NEXT_PUBLIC_GA_ID,
    FB_PIXEL_ID: remote.FB_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID,
    WHATSAPP_NUMBER: remote.WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    STORE_NAME: remote.STORE_NAME,
  };
}
