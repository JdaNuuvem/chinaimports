import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    // Allow SVG (placehold.co returns SVG by default). Mitigated by sandbox CSP.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    return [
      {
        source: "/api/medusa/:path*",
        destination: `${backendUrl}/:path*`,
      },
      // Note: /uploads/:path* is NOT rewritten — it is served locally by
      // the storefront. Static files under public/uploads/ are served by
      // Next.js's built-in static handler; files uploaded at runtime live
      // in UPLOADS_DIR (/app/data/uploads in production) and are served by
      // the route handler at src/app/uploads/[...path]/route.ts.
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      // HSTS only when serving over real HTTPS (set FORCE_HTTPS=true in env)
      ...(process.env.FORCE_HTTPS === "true"
        ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
        : []),
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/product/:slug*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        source: "/collections/:handle*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=120, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=120" },
        ],
      },
      {
        source: "/about",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=7200" },
        ],
      },
      {
        source: "/faq",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=3600, stale-while-revalidate=7200" },
        ],
      },
      {
        source: "/blog/:slug*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=1800, stale-while-revalidate=3600" },
        ],
      },
    ];
  },
};

export default nextConfig;
