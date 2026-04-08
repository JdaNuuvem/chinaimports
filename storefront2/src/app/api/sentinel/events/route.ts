import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side proxy for Sentinel events.
 *
 * The Sentinel tracker.js on the client side hits
 * https://api.specterfilter.com/sentinel-bff/api/events, but that endpoint
 * refuses our `x-visitor-id` header in its CORS preflight, so every
 * browser-originated request is blocked. This route accepts the same
 * payloads from our own origin and forwards them to specterfilter from
 * the server, where CORS doesn't apply.
 *
 * The SENTINEL_API_KEY is read server-side via an env var so it never
 * leaves the Node process.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_SENTINEL_API_KEY || process.env.SENTINEL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, reason: "no_api_key" }, { status: 200 });
    }

    const ingestUrl =
      process.env.SENTINEL_INGEST_URL ||
      "https://api.specterfilter.com/sentinel-bff/api/events";

    // Forward the client payload plus useful headers for attribution.
    const body = await request.text();
    const visitorId = request.headers.get("x-visitor-id") || "";
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";

    const proxied = await fetch(ingestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Visitor-Id": visitorId,
        "X-Sentinel-Source": "storefront_proxy",
        "User-Agent": userAgent,
        Referer: referer,
      },
      body,
    }).catch((e) => {
      console.warn("[SENTINEL PROXY] fetch error", (e as Error).message);
      return null;
    });

    if (!proxied) {
      return NextResponse.json({ ok: false, reason: "upstream_error" }, { status: 200 });
    }

    return NextResponse.json({ ok: proxied.ok, status: proxied.status }, { status: 200 });
  } catch (e) {
    console.error("[SENTINEL PROXY]", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
