"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/utils";

interface SuggestedProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price: number;
  variantId: string;
}

export default function CrossSell() {
  const { cart, addItem, loading } = useCart();
  const [products, setProducts] = useState<SuggestedProduct[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!cart?.items?.length) return;

    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    fetch(`${backendUrl}/store/products?limit=6&offset=0`)
      .then((r) => r.json())
      .then((data) => {
        const cartProductIds = new Set(cart.items.map((i) => i.variant?.id));
        const suggestions = (data.products || [])
          .filter((p: { variants?: Array<{ id: string }> }) => !p.variants?.some((v) => cartProductIds.has(v.id)))
          .slice(0, 3)
          .map((p: { id: string; title: string; handle: string; thumbnail: string | null; variants?: Array<{ id: string; prices?: Array<{ amount: number }> }> }) => ({
            id: p.id,
            title: p.title,
            handle: p.handle,
            thumbnail: p.thumbnail,
            price: p.variants?.[0]?.prices?.[0]?.amount || 0,
            variantId: p.variants?.[0]?.id || "",
          }));
        setProducts(suggestions);
      })
      .catch(() => {});
  }, [cart?.items]);

  const visible = products.filter((p) => !dismissed.has(p.id));
  if (visible.length === 0) return null;

  return (
    <div style={{ marginTop: 24, padding: "16px", background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb" }}>
      <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: "#202223" }}>
        Você também pode gostar
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map((product) => (
          <div key={product.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 8, padding: "10px 12px", border: "1px solid #e5e7eb" }}>
            <div style={{ width: 48, height: 48, borderRadius: 6, background: "#f0f0f0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 20 }}>📦</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <a href={`/product/${product.handle}`} style={{ fontSize: 13, fontWeight: 600, color: "#202223", textDecoration: "none", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {product.title}
              </a>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary-color, #1e2d7d)" }}>
                {formatMoney(product.price)}
              </span>
            </div>
            <button
              onClick={() => product.variantId && addItem(product.variantId, 1)}
              disabled={loading || !product.variantId}
              style={{ padding: "6px 12px", fontSize: 11, fontWeight: 600, border: "1px solid var(--primary-color, #1e2d7d)", borderRadius: 6, background: "#fff", color: "var(--primary-color, #1e2d7d)", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              + Adicionar
            </button>
            <button
              onClick={() => setDismissed((prev) => new Set([...prev, product.id]))}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 12, padding: 4 }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
