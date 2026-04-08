import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Proxy client-side Sentinel events to the Express backend, which has
 * access to SENTINEL_API_KEY via the settings table and will forward
 * the event to api.specterfilter.com using the existing
 * forwardToSentinel helper.
 *
 * Going through the backend (instead of calling specterfilter directly
 * from this Next.js route) keeps the secret in one place and bypasses
 * the Specterfilter CORS block on the browser side.
 */
export async function POST(request: NextRequest) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

    const body = await request.text();
    const visitorId = request.headers.get("x-visitor-id") || "";
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";

    await fetch(`${backendUrl}/store/sentinel/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Visitor-Id": visitorId,
        "User-Agent": userAgent,
        Referer: referer,
      },
      body,
    }).catch((e) => {
      console.warn("[SENTINEL PROXY] backend fetch error", (e as Error).message);
    });

    // Always 200 — we don't want a failing Sentinel ingest to break the
    // storefront UX. navigator.sendBeacon doesn't care about the status
    // code either.
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[SENTINEL PROXY]", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
