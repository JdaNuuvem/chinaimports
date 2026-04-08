import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Fallback route for files uploaded at runtime.
// Next.js serves static files from public/ first, so baked-in files under
// public/uploads keep working. If the file isn't in public/, this route
// reads from the persistent uploads dir (UPLOADS_DIR, mounted as a Coolify
// volume in production).

const UPLOADS_DIR =
  process.env.UPLOADS_DIR || path.join(process.cwd(), "public/uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await context.params;
    if (!segments || segments.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Sanitize: reject traversal attempts, absolute paths and dotfiles
    const joined = segments.join("/");
    if (
      joined.includes("..") ||
      joined.includes("\\") ||
      joined.startsWith("/") ||
      segments.some((s) => s.startsWith("."))
    ) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Only serve known image extensions — anything else (e.g. .json config
    // files living in the same volume) is rejected.
    const ext = path.extname(joined).toLowerCase();
    if (!MIME[ext]) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const filePath = path.join(UPLOADS_DIR, joined);
    const resolved = path.resolve(filePath);
    const resolvedRoot = path.resolve(UPLOADS_DIR);
    if (!resolved.startsWith(resolvedRoot + path.sep) && resolved !== resolvedRoot) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const contentType = MIME[ext];

    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
      const data = fs.readFileSync(resolved);
      return new NextResponse(new Uint8Array(data), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Fallback: forward to the backend Express server, which has its own
    // /uploads/ tree (e.g. /uploads/products/* from product imports).
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
      process.env.MEDUSA_BACKEND_URL ||
      "http://localhost:9000";
    try {
      const proxied = await fetch(`${backendUrl}/uploads/${joined}`);
      if (proxied.ok) {
        const buf = Buffer.from(await proxied.arrayBuffer());
        return new NextResponse(new Uint8Array(buf), {
          status: 200,
          headers: {
            "Content-Type": proxied.headers.get("content-type") || contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch {
      // fall through to 404
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
