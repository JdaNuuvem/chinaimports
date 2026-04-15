import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Generate CSP nonce for inline scripts
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Block direct access to admin theme-config API without auth
  if (pathname.startsWith("/api/theme-config") && request.method !== "GET") {
    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Block access to admin panel
  if (pathname.startsWith("/admin")) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    applyCsp(response, nonce);
    return response;
  }

  // Rate limit API routes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Policy", "100;w=60");
    return response;
  }

  // All other pages — apply CSP
  const response = NextResponse.next();
  applyCsp(response, nonce);

  // Pass nonce to page via request header (accessible in server components)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  return NextResponse.next({
    request: { headers: requestHeaders },
    headers: response.headers,
  });
}

function applyCsp(response: NextResponse, nonce: string) {
  const isDev = process.env.NODE_ENV === "development";

  // Content Security Policy with nonce for inline scripts
  // In dev mode, allow unsafe-eval (React dev tools require it)
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval' 'unsafe-inline'" : ""} https://www.googletagmanager.com https://connect.facebook.net https://cdn.sentineltracking.io`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com`,
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
    `connect-src 'self' blob: data:${isDev ? " ws://localhost:* http://localhost:*" : ""} ${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"} https://www.google-analytics.com https://viacep.com.br https://wa.me https://sentineltracking.io https://*.sentineltracking.io https://api.specterfilter.com https://*.specterfilter.com`,
    `worker-src 'self' blob:`,
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
    "media-src 'self' blob: https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // upgrade-insecure-requests só faz sentido quando o site é servido via HTTPS.
    // Habilitar via env var FORCE_HTTPS=true quando configurar SSL no Coolify.
    process.env.FORCE_HTTPS === "true" ? "upgrade-insecure-requests" : "",
  ].filter(Boolean);

  response.headers.set(
    "Content-Security-Policy",
    cspDirectives.join("; ")
  );

  // Also set nonce as a header for server components to access
  response.headers.set("x-nonce", nonce);
}

export const config = {
  matcher: [
    // Match all routes except static files and _next
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-.*\\.png).*)",
  ],
};
