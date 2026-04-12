"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatMoney, calculateDiscount } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { getThemeConfig } from "@/lib/theme-config";

interface ProductCardProps {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price: number;
  compareAtPrice?: number | null;
  vendor?: string;
  labels?: string[];
  showDiscount?: boolean;
  variantId?: string;
  inStock?: boolean;
  /** Total stock for the displayed variant. Renders "Última peça" badge when ≤ 3. */
  inventoryQuantity?: number;
  /** Per-product Luna checkout URL. When set, Quick Add bypasses the cart. */
  lunaCheckoutUrl?: string | null;
  /** When true, Quick Add adds the item then jumps to /checkout. */
  skipCart?: boolean;
}

const LOW_STOCK_THRESHOLD = 3;

export default function ProductCard({
  title,
  handle,
  thumbnail,
  price,
  compareAtPrice,
  vendor,
  labels = [],
  showDiscount = true,
  variantId,
  inStock = true,
  inventoryQuantity,
  lunaCheckoutUrl,
  skipCart,
}: ProductCardProps) {
  const isLowStock =
    inStock &&
    typeof inventoryQuantity === "number" &&
    inventoryQuantity > 0 &&
    inventoryQuantity <= LOW_STOCK_THRESHOLD;
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discount = hasDiscount ? calculateDiscount(compareAtPrice!, price) : 0;
  const config = getThemeConfig();
  const ctaAlign = config.product.ctaAlignment || "left";
  const { addItem, loading } = useCart();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If the product has a Luna URL, Quick Add jumps straight to Luna
    // without touching the local cart — use Sentinel's redirectWith
    // Tracking to preserve visitor_id on the outbound URL.
    if (lunaCheckoutUrl) {
      const { redirectWithTracking } = await import("@/lib/sentinel").catch(() => ({ redirectWithTracking: null as ((u: string) => void) | null }));
      if (redirectWithTracking) redirectWithTracking(lunaCheckoutUrl);
      else window.location.href = lunaCheckoutUrl;
      return;
    }

    if (!variantId || !inStock) return;
    await addItem(variantId, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    // skipCart without a Luna URL: open the local checkout directly.
    if (skipCart) {
      window.location.href = "/checkout";
    }
  };

  // Fire select_item when the user clicks the card to open the PDP
  const trackClick = () => {
    import("@/lib/sentinel").then(({ trackSelectItem }) => {
      trackSelectItem("product_card", { id: handle, title, price });
    }).catch(() => {});
  };

  return (
    <div
      className="product-item product-item--vertical fade-in-up"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {(labels.length > 0 || (hasDiscount && showDiscount)) && (
        <div className="product-item__label-list" style={{ zIndex: 2 }}>
          {labels.map((label, i) => (
            <span key={i} className="product-label product-label--custom1">{label}</span>
          ))}
          {hasDiscount && showDiscount && (
            <span className="product-label product-label--on-sale badge-bounce">{discount}% OFF</span>
          )}
        </div>
      )}

      {!inStock && (
        <div style={{
          position: "absolute", top: 8, right: 8, zIndex: 2,
          background: "#6b7280", color: "#fff", padding: "3px 8px",
          borderRadius: 4, fontSize: 10, fontWeight: 700,
        }}>
          Esgotado
        </div>
      )}

      {isLowStock && (
        <div style={{
          position: "absolute", top: 8, right: 8, zIndex: 2,
          background: "#dc2626", color: "#fff", padding: "4px 10px",
          borderRadius: 4, fontSize: 10, fontWeight: 800,
          letterSpacing: 0.5, textTransform: "uppercase",
          boxShadow: "0 2px 6px rgba(220,38,38,0.4)",
          animation: "pulse 2s ease-in-out infinite",
        }}>
          {inventoryQuantity === 1 ? "Última peça!" : `Só ${inventoryQuantity} restantes`}
        </div>
      )}

      <Link href={`/product/${handle}`} onClick={trackClick} className="product-item__image-wrapper" style={{ position: "relative", display: "block", overflow: "hidden", background: "#f3f4f6", width: "100%", margin: 0, padding: 0, borderRadius: 0 }}>
        <div className="aspect-ratio aspect-ratio--square" style={{ aspectRatio: "1/1", position: "relative", width: "100%" }}>
          <Image
            src={thumbnail || "https://placehold.co/400x400/f5f5f5/999?text=Sem+Imagem"}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-item__primary-image"
            style={{ objectFit: "cover", opacity: inStock ? 1 : 0.5 }}
          />
        </div>

        {/* Quick Add button on hover */}
        {variantId && inStock && hovered && (
          <button
            onClick={handleQuickAdd}
            disabled={loading}
            className="scale-in"
            style={{
              position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
              background: added ? "#16a34a" : "var(--primary-button-background, #1e2d7d)",
              color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 22px", fontSize: 12, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              whiteSpace: "nowrap",
              zIndex: 3,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {added ? "✓ Adicionado!" : loading ? "..." : "Compra Rápida"}
          </button>
        )}
      </Link>

      <div className="product-item__info" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
        {vendor && (
          <p className="product-item__vendor" style={{
            fontSize: 11, fontWeight: 500, color: "#9ca3af",
            textTransform: "uppercase", letterSpacing: 0.6, margin: "0 0 4px 0",
          }}>
            {vendor}
          </p>
        )}
        <Link href={`/product/${handle}`} className="product-item__title" style={{ textDecoration: "none" }}>
          <span style={{
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden", fontSize: 14, fontWeight: 600,
            lineHeight: 1.35, color: "#1a1c1e", minHeight: "2.7em",
          }}>
            {title}
          </span>
        </Link>
        <div className="product-item__price-list" style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          {hasDiscount && (
            <span style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: 12 }}>
              {formatMoney(compareAtPrice!)}
            </span>
          )}
          <span style={{
            fontSize: 17, fontWeight: 800,
            color: hasDiscount ? "#16a34a" : "#1a1c1e",
          }}>
            {formatMoney(price)}
          </span>
        </div>
        {hasDiscount && (
          <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: "#dc2626" }}>
            Economize {formatMoney(compareAtPrice! - price)}
          </div>
        )}
        {/* VER DETALHES CTA — alignment controlled by config.product.ctaAlignment */}
        <div style={{ textAlign: ctaAlign, marginTop: 12 }}>
          <Link
            href={`/product/${handle}`}
            className="product-card__cta cta-pulse"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "10px 14px", borderRadius: 8,
              background: "#22c55e", color: "#fff",
              fontSize: 12, fontWeight: 700, letterSpacing: 0.8,
              textTransform: "uppercase", textDecoration: "none",
              transition: "background 0.2s",
            }}
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
