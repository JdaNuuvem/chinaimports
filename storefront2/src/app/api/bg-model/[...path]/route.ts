import { NextRequest, NextResponse } from "next/server";

const CDN_BASE =
  "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";

const FALLBACK_CDNS = [
  "https://unpkg.com/@imgly/background-removal@1.7.0/dist/",
  "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/",
];

async function fetchFromCDN(path: string): Promise<Response> {
  // Try primary CDN first
  const urls = [CDN_BASE + path, ...FALLBACK_CDNS.map((base) => base + path)];

  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (res.ok) return res;
    } catch {
      // Try next CDN
    }
  }

  throw new Error(`All CDNs failed for: ${path}`);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filePath = path.join("/");

  try {
    const upstream = await fetchFromCDN(filePath);
    const data = await upstream.arrayBuffer();

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fetch failed" },
      { status: 502 }
    );
  }
}
