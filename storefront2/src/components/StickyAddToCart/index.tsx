"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatMoney, calculateDiscount } from "@/lib/utils";

interface StickyAddToCartProps {
  productTitle: string;
  price: number;
  comparePrice?: number | null;
  variantId: string;
  inStock: boolean;
  thumbnail?: string | null;
  lunaCheckoutUrl?: string | null;
}

export default function StickyAddToCart({ productTitle, price, comparePrice, variantId, inStock, thumbnail, lunaCheckoutUrl }: StickyAddToCartProps) {
  const [visible, setVisible] = useState(false);
  const { addItem, loading } = useCart();
  const hasDiscount = comparePrice != null && comparePrice > price;
  const discount = hasDiscount ? calculateDiscount(comparePrice!, price) : 0;
  const pixPrice = Math.round(price * 0.95);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Show when scrolled past the buy button — and only if purchasable (in stock OR luna URL bypasses cart)
  if (!visible || (!inStock && !lunaCheckoutUrl)) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes stickyBarSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .sticky-add-bar {
          animation: stickyBarSlideUp 0.3s ease-out;
        }
        .sticky-add-bar__buy {
          animation: cta-pulse 2s ease-in-out infinite;
          transition: background 0.2s, transform 0.15s;
        }
        .sticky-add-bar__buy:hover { background: #16a34a !important; }
        .sticky-add-bar__buy:active { transform: scale(0.97); }
      `}} />
      <div
        className="sticky-add-bar"
        role="region"
        aria-label={`Comprar ${productTitle}`}
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 9990,
          background: "#fff",
          borderTop: "1px solid #e5e7eb",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Thumbnail (hidden on smallest mobile to save space) */}
        {thumbnail && (
          <img
            src={thumbnail}
            alt=""
            className="sticky-thumb"
            style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid #e5e7eb" }}
          />
        )}

        {/* Price block */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#1a1c1e" }}>{formatMoney(price)}</span>
            {hasDiscount && (
              <>
                <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through" }}>
                  {formatMoney(comparePrice!)}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#fff", background: "#16a34a",
                  padding: "1px 6px", borderRadius: 4,
                }}>
                  -{discount}%
                </span>
              </>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginTop: 2 }}>
            R$ {(pixPrice / 100).toFixed(2).replace(".", ",")} no PIX
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            if (lunaCheckoutUrl) {
              import("@/lib/sentinel")
                .then(({ redirectWithTracking }) => redirectWithTracking(lunaCheckoutUrl))
                .catch(() => { window.location.href = lunaCheckoutUrl; });
              return;
            }
            addItem(variantId, 1);
          }}
          disabled={loading}
          className="sticky-add-bar__buy"
          style={{
            padding: "14px 22px",
            background: "#22c55e",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            cursor: loading ? "wait" : "pointer",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {loading ? "..." : "Comprar"}
        </button>
      </div>
    </>
  );
}
