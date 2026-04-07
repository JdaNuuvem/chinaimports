import Script from "next/script";

interface SentinelTrackerProps {
  apiKey?: string;
  nonce?: string;
}

/**
 * Build the inline Sentinel config IIFE. Exported for unit testing.
 * The returned string preserves UTM params across SPA navigation via
 * localStorage `s_a`, exposes `window.__sentinel_landing`, and sets
 * `window._sCfg = { api_key }` so the tracker script can read it.
 */
export function buildSentinelConfigScript(apiKey: string): string {
  return `(function(){var s=location.search,h=location.href;try{if(!/[?&]utm_/.test(s)){var sa=localStorage.getItem("s_a");if(sa){var a=JSON.parse(sa);if(a&&a.utm_source){var p=new URLSearchParams(s);["utm_source","utm_medium","utm_campaign","utm_content","utm_term","click_id","pixel_id","gclid","fbclid"].forEach(function(k){if(a[k]&&!p.has(k))p.set(k,a[k])});s="?"+p.toString();h=h.split("?")[0]+s}}}}catch(e){}window.__sentinel_landing={search:s,href:h};window._sCfg={api_key:${JSON.stringify(apiKey)}};})()`;
}

export const SENTINEL_TRACKER_SRC = "https://cdn.sentineltracking.io/latest/tracker.js";

/**
 * Sentinel Tracking — https://docs.sentineltracking.io
 *
 * Loads two scripts:
 *   1. Inline `sentinel-config` (beforeInteractive) — restores UTM params from
 *      previous landing (stored in localStorage `s_a`), exposes
 *      `window.__sentinel_landing` + `window._sCfg = { api_key }` so the tracker
 *      can pick them up. This must run BEFORE the tracker so attribution is
 *      preserved across SPA navigations and across sessions.
 *   2. `sentinel-tracker` (beforeInteractive) — fetches the actual tracker
 *      from the Sentinel CDN. It auto-tracks page views, clicks, form
 *      submissions, etc., and reads its config from `window._sCfg`.
 *
 * Env var: NEXT_PUBLIC_SENTINEL_API_KEY (must start with `sk_`)
 *
 * No-op if `apiKey` is missing.
 */
export default function SentinelTracker({ apiKey, nonce }: SentinelTrackerProps) {
  if (!apiKey) return null;

  const configScript = buildSentinelConfigScript(apiKey);

  return (
    <>
      <Script
        id="sentinel-config"
        strategy="beforeInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: configScript }}
      />
      <Script
        id="sentinel-tracker"
        strategy="beforeInteractive"
        nonce={nonce}
        src={SENTINEL_TRACKER_SRC}
      />
    </>
  );
}
