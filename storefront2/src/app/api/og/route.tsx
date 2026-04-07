import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Imports China Brasil";
  const price = searchParams.get("price") || "";
  const image = searchParams.get("image") || "";
  const discount = searchParams.get("discount") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #1e2d7d 0%, #0a1628 100%)",
          padding: 40,
        }}
      >
        {/* Left: Product image */}
        {image && (
          <div style={{ width: 400, height: 400, borderRadius: 16, overflow: "hidden", marginRight: 40, display: "flex" }}>
            <img
              src={image}
              alt=""
              width={400}
              height={400}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
        )}

        {/* Right: Info */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", color: "#fff" }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8,
              background: "#fff", color: "#1e2d7d",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 18,
            }}>
              IC
            </div>
            <span style={{ fontSize: 16, opacity: 0.8, letterSpacing: 2 }}>
              IMPORTS CHINA BRASIL
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 48, fontWeight: 800, margin: 0, lineHeight: 1.1, maxWidth: 500 }}>
            {title.length > 60 ? title.slice(0, 57) + "..." : title}
          </h1>

          {/* Price */}
          {price && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
              <span style={{ fontSize: 36, fontWeight: 800 }}>{price}</span>
              {discount && (
                <span style={{
                  background: "#dc2626", color: "#fff",
                  padding: "6px 14px", borderRadius: 8,
                  fontSize: 20, fontWeight: 700,
                }}>
                  {discount}
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <div style={{
            marginTop: 24, display: "flex",
            background: "#fff", color: "#1e2d7d",
            padding: "12px 28px", borderRadius: 10,
            fontWeight: 700, fontSize: 18,
            width: "fit-content",
          }}>
            Comprar agora →
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
