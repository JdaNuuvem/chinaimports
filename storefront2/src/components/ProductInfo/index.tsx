"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatMoney, calculateDiscount } from "@/lib/utils";
import { getThemeConfig } from "@/lib/theme-config";
import ShippingEstimate from "@/components/ShippingEstimate";
import type { Product, ProductVariant } from "@/lib/medusa-client";

interface ProductInfoProps {
  product: Product;
  onVariantChange?: (variant: ProductVariant) => void;
}

const GH_RAW = "https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/master/flat-rounded";

const PAYMENT_FLAGS: Array<{ name: string; img: string }> = [
  { name: "Mastercard", img: `${GH_RAW}/mastercard.svg` },
  { name: "Visa", img: `${GH_RAW}/visa.svg` },
  { name: "Elo", img: `${GH_RAW}/elo.svg` },
  { name: "Hipercard", img: `${GH_RAW}/hipercard.svg` },
  { name: "Amex", img: `${GH_RAW}/amex.svg` },
  { name: "Diners Club", img: `${GH_RAW}/diners.svg` },
  { name: "Boleto", img: "/icons/boleto.svg" },
  { name: "PIX", img: "/icons/pix.svg" },
];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill={filled ? "#f59e0b" : "#d1d5db"} xmlns="http://www.w3.org/2000/svg">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function ProductInfo({ product, onVariantChange }: ProductInfoProps) {
  const config = getThemeConfig();
  const { addItem, loading } = useCart();
  const [selectedVariant, setSelectedVariantState] = useState<ProductVariant>(product.variants[0]);
  const setSelectedVariant = (v: ProductVariant) => {
    setSelectedVariantState(v);
    onVariantChange?.(v);
  };

  const price = selectedVariant?.prices[0]?.amount || 0;
  const comparePrice = selectedVariant?.original_price;
  const hasDiscount = comparePrice != null && comparePrice > price;
  const discount = hasDiscount ? calculateDiscount(comparePrice!, price) : 0;
  const inStock = (selectedVariant?.inventory_quantity ?? 0) > 0;
  const lunaCheckoutUrl = (product as Product & { luna_checkout_url?: string | null }).luna_checkout_url;
  const skipCart = (product as Product & { skip_cart?: boolean }).skip_cart === true;
  // Luna URL bypasses cart so it's always "purchasable" if URL is set
  const canBuy = !!lunaCheckoutUrl || inStock;
  const pixPrice = Math.round(price * 0.95);
  const installmentPrice = Math.ceil(price / 12);
  const savings = hasDiscount ? comparePrice! - price : 0;

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (selectedVariant?.options) {
      product.options.forEach((opt, i) => {
        const varOpt = selectedVariant.options[i];
        if (varOpt) initial[opt.title] = varOpt.value;
      });
    }
    if (Object.keys(initial).length === 0 && selectedVariant?.title) {
      const parts = selectedVariant.title.split(/\s*\/\s*/);
      product.options.forEach((opt, i) => {
        if (parts[i]) initial[opt.title] = parts[i].trim();
      });
    }
    return initial;
  });

  // Simulated "pessoas vendo agora" — lazy init avoids effect-based setState
  const [viewerCount] = useState(() => {
    let hash = 0;
    for (let i = 0; i < product.id.length; i++) {
      hash = ((hash << 5) - hash) + product.id.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 20) + 5;
  });

  // Real review count + average rating, fetched from the backend.
  // Falls back to 0/0 until the request resolves so the UI never shows
  // a fake number while loading.
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/medusa/store/products/${product.id}/reviews?limit=1`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setReviewCount(Number(data.total) || 0);
        setRating(Number(data.averageRating) || 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const selectOption = (optionTitle: string, value: string) => {
    const newSelected = { ...selectedOptions, [optionTitle]: value };
    setSelectedOptions(newSelected);
    const variant = product.variants.find((v) => {
      if (v.options && v.options.length > 0) {
        return product.options.every((opt) => {
          const wantedValue = newSelected[opt.title];
          if (!wantedValue) return true;
          return v.options.some((vo) => vo.value === wantedValue);
        });
      }
      const titleParts = v.title.split(/\s*\/\s*/).map((s) => s.trim());
      return product.options.every((opt, i) => {
        const wantedValue = newSelected[opt.title];
        if (!wantedValue) return true;
        return titleParts[i] === wantedValue;
      });
    });
    if (variant) setSelectedVariant(variant);
  };

  // Truncated description
  const descriptionText = product.description || "";
  const [descExpanded, setDescExpanded] = useState(false);
  const descLimit = 200;
  const showToggle = descriptionText.length > descLimit;

  return (
    <div style={{ fontSize: 15, color: "#1a1c1e" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes infoFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes buyPulseGlow {
          0%, 100% {
            box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4), 0 0 0 0 rgba(34, 197, 94, 0.5);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 6px 24px rgba(34, 197, 94, 0.6), 0 0 0 8px rgba(34, 197, 94, 0);
            transform: scale(1.015);
          }
        }
        @keyframes liveDotPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
        @keyframes savingsBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
        .pi-fade-in { animation: infoFadeIn 0.5s ease-out both; }
        .pi-fade-1 { animation-delay: 0.05s; }
        .pi-fade-2 { animation-delay: 0.1s; }
        .pi-fade-3 { animation-delay: 0.15s; }
        .pi-fade-4 { animation-delay: 0.2s; }
        .pi-fade-5 { animation-delay: 0.25s; }
        .pi-fade-6 { animation-delay: 0.3s; }
        .pi-fade-7 { animation-delay: 0.35s; }
        .pi-fade-8 { animation-delay: 0.4s; }
        .live-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: liveDotPulse 1.4s ease-in-out infinite; flex-shrink: 0; }
        .savings-text { animation: savingsBlink 2.4s ease-in-out infinite; }
        .buy-now-btn { animation: buyPulseGlow 2s ease-in-out infinite; transition: background 0.2s; }
        .buy-now-btn:hover { background: #16a34a !important; animation-play-state: paused; box-shadow: 0 8px 28px rgba(22, 163, 74, 0.55) !important; transform: scale(1.02) !important; }
        .buy-now-btn:active { transform: scale(0.97) !important; animation-play-state: paused; }
        .variant-pill { transition: all 0.2s ease; }
        .variant-pill:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .trust-badge { transition: all 0.25s ease; }
        .trust-badge:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(22, 163, 74, 0.12); border-color: #86efac !important; }
        .payment-flag { transition: transform 0.2s; }
        .payment-flag:hover { transform: translateY(-2px) scale(1.05); }
        .review-link:hover .review-stars-text { text-decoration: underline; }
      `}} />

      {/* Store name */}
      <div className="pi-fade-in pi-fade-1" style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        {config.identity.storeName}
      </div>

      {/* Product title */}
      <h1 className="pi-fade-in pi-fade-2" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.25, margin: "0 0 12px 0", color: "#1a1c1e" }}>
        {product.title}
      </h1>

      {/* Stars + reviews + viewers */}
      <div className="pi-fade-in pi-fade-3" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <a href="#product-reviews" className="review-link" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
          <span style={{ display: "inline-flex", gap: 1 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <StarIcon key={n} filled={n <= Math.round(rating)} />
            ))}
          </span>
          <span className="review-stars-text" style={{ fontSize: 14, color: "#f59e0b", fontWeight: 600 }}>{reviewCount} avaliações</span>
        </a>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280" }}>
          <span className="live-dot" />
          {viewerCount} pessoas vendo agora
        </span>
      </div>

      {/* Price block */}
      <div className="pi-fade-in pi-fade-4" style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
        {hasDiscount && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: 15 }}>
              {formatMoney(comparePrice!)}
            </span>
            <span style={{ background: "#16a34a", color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
              -{discount}% OFF
            </span>
          </div>
        )}
        <div style={{ fontSize: 32, fontWeight: 800, color: "#1a1c1e", marginBottom: 8 }}>
          {formatMoney(price)}
        </div>
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 0 4px 0", fontSize: 14, color: "#1a1c1e" }}>
          <span style={{ background: "#16a34a", color: "#fff", padding: "1px 6px", borderRadius: 3, fontSize: 11, fontWeight: 700 }}>PIX</span>
          {formatMoney(pixPrice)} no PIX
          <span style={{ color: "#16a34a", fontWeight: 600 }}>(5% off)</span>
        </p>
        <p style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 0 6px 0", fontSize: 14, color: "#6b7280" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          ou 12x de {formatMoney(installmentPrice)} sem juros
        </p>
        {hasDiscount && (
          <p className="savings-text" style={{ margin: 0, fontSize: 14, color: "#16a34a", fontWeight: 600 }}>
            Você economiza {formatMoney(savings)} neste produto!
          </p>
        )}
      </div>

      {/* Shipping estimate */}
      <ShippingEstimate />

      {/* Description */}
      <div className="pi-fade-in pi-fade-5" style={{ marginBottom: 20, fontSize: 15, lineHeight: 1.7, color: "#374151" }}>
        <p style={{ margin: 0 }}>
          {descExpanded || !showToggle
            ? descriptionText
            : descriptionText.slice(0, descLimit) + "..."}
        </p>
        {showToggle && (
          <button
            onClick={() => setDescExpanded(!descExpanded)}
            style={{
              background: "none", border: "none", color: "#16a34a",
              fontWeight: 600, cursor: "pointer", padding: "4px 0", fontSize: 14,
            }}
          >
            {descExpanded ? "Ver menos" : "Ver mais"}
          </button>
        )}
      </div>

      {/* Variant options */}
      {product.options.map((option) => (
        <div key={option.id} className="pi-fade-in pi-fade-6" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px 0", color: "#1a1c1e" }}>
            {option.title}
            <span style={{ fontWeight: 400, color: "#6b7280" }}> — {selectedOptions[option.title] || ""}</span>
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {option.values.map((val) => {
              const isSelected = selectedOptions[option.title] === val.value;
              return (
                <button
                  key={val.id}
                  className="variant-pill"
                  onClick={() => selectOption(option.title, val.value)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 8,
                    border: isSelected ? "2px solid #16a34a" : "1px solid #d1d5db",
                    background: isSelected ? "#16a34a" : "#fff",
                    color: isSelected ? "#fff" : "#374151",
                    cursor: "pointer",
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 14,
                  }}
                >
                  {val.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* COMPRAR AGORA button — uses Luna URL if set on product, else adds to cart */}
      <button
        type="button"
        aria-label={!canBuy ? `${product.title} esgotado` : `Comprar ${product.title}`}
        aria-disabled={loading || !canBuy}
        onClick={async () => {
          // Luna URL set → always skip cart and go straight to Luna.
          // Use Sentinel.redirectWithTracking so visitor_id + UTM are
          // appended to the outbound URL for attribution.
          if (lunaCheckoutUrl) {
            import("@/lib/sentinel")
              .then(({ redirectWithTracking }) => redirectWithTracking(lunaCheckoutUrl))
              .catch(() => { window.location.href = lunaCheckoutUrl; });
            return;
          }
          if (!selectedVariant || !inStock) return;
          // Skip-cart mode: add the item then jump straight to checkout
          // instead of opening the mini-cart drawer.
          if (skipCart) {
            await addItem(selectedVariant.id, 1);
            window.location.href = "/checkout";
            return;
          }
          addItem(selectedVariant.id, 1);
        }}
        disabled={loading || !canBuy}
        className="buy-now-btn pi-fade-in pi-fade-7"
        style={{
          width: "100%",
          padding: "18px 32px",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          cursor: !canBuy ? "not-allowed" : "pointer",
          background: !canBuy ? "#9ca3af" : "#22c55e",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 10,
          opacity: !canBuy ? 0.7 : 1,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        {!canBuy ? "ESGOTADO" : loading ? "ADICIONANDO..." : "COMPRAR AGORA"}
      </button>

      {/* Security message */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 20, fontSize: 13, color: "#6b7280" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        Compra 100% segura — seus dados estão protegidos
      </div>

      {/* Trust badges */}
      <div className="pi-fade-in pi-fade-8" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Entrega rápida", icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          )},
          { label: "Compra segura", icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          )},
          { label: "Troca garantida", icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          )},
        ].map((badge) => (
          <div key={badge.label} className="trust-badge" style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 6, padding: "16px 8px",
            border: "1px solid #e5e7eb", borderRadius: 10,
            fontSize: 12, color: "#374151", fontWeight: 500, textAlign: "center",
            cursor: "default",
          }}>
            {badge.icon}
            {badge.label}
          </div>
        ))}
      </div>

      {/* Payment methods */}
      <div>
        <p style={{ margin: "0 0 8px 0", fontSize: 13, color: "#6b7280" }}>Formas de pagamento</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PAYMENT_FLAGS.map((flag) => (
            <img
              key={flag.name}
              className="payment-flag"
              src={flag.img}
              alt={flag.name}
              title={flag.name}
              style={{ height: 30, width: "auto", borderRadius: 4 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
