import Script from "next/script";

interface SentinelTrackerProps {
  apiKey?: string;
  nonce?: string;
}

/**
 * Inline script that calls Sentinel.init({api_key}) as soon as the tracker
 * loads. This is the contract documented at
 * https://docs.sentineltracking.io/docs/configuracao/implementacao-direta
 * — the SDK exposes a global `Sentinel` with `init`, `track` and
 * `redirectWithTracking` helpers after its script runs.
 */
export function buildSentinelInitScript(apiKey: string): string {
  return `(function(){function init(){try{if(window.Sentinel&&typeof window.Sentinel.init==='function'){window.Sentinel.init({api_key:${JSON.stringify(apiKey)}});}}catch(e){console.warn('[Sentinel init]',e);}}if(window.Sentinel)init();else{var t=setInterval(function(){if(window.Sentinel){clearInterval(t);init();}},100);setTimeout(function(){clearInterval(t);},10000);}})();`;
}

export const SENTINEL_TRACKER_SRC = "https://cdn.sentineltracking.io/latest/tracker.js";

/**
 * Sentinel Tracking — https://docs.sentineltracking.io
 *
 * Loads the official SDK from cdn.sentineltracking.io and calls
 * Sentinel.init({api_key}) once it's ready. The SDK handles:
 *   - generating / persisting visitor_id in localStorage
 *   - preserving UTM / click_id / gclid / fbclid / ttclid across navigations
 *   - auto-sending page_view on first load
 *   - exposing Sentinel.track(event, data) for explicit events
 *   - exposing Sentinel.redirectWithTracking(url) to forward visitor_id
 *     through external checkout URLs (Luna, etc.)
 *
 * Events are sent to the tenant-specific ingest endpoint configured in
 * the Sentinel dashboard. No manual proxy or config file needed.
 *
 * No-op if `apiKey` is missing.
 */
export default function SentinelTracker({ apiKey, nonce }: SentinelTrackerProps) {
  if (!apiKey) return null;

  return (
    <>
      <Script
        id="sentinel-tracker"
        strategy="afterInteractive"
        nonce={nonce}
        src={SENTINEL_TRACKER_SRC}
      />
      <Script
        id="sentinel-init"
        strategy="afterInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: buildSentinelInitScript(apiKey) }}
      />
    </>
  );
}
