"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/utils";

interface BundleProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price: number;
  variantId: string;
}

interface BuyTogetherProps {
  currentProductId: string;
  discountPercent?: number;
}

export default function BuyTogether({ currentProductId, discountPercent = 10 }: BuyTogetherProps) {
  const { addItem, loading } = useCart();
  const [suggestions, setSuggestions] = useState<BundleProduct[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    fetch(`${backendUrl}/store/products?limit=4&offset=0`)
      .then((r) => r.json())
      .then((data) => {
        const products = (data.products || [])
          .filter((p: { id: string }) => p.id !== currentProductId)
          .slice(0, 2)
          .map((p: { id: string; title: string; handle: string; thumbnail: string | null; variants?: Array<{ id: string; prices?: Array<{ amount: number }> }> }) => ({
            id: p.id,
            title: p.title,
            handle: p.handle,
            thumbnail: p.thumbnail,
            price: p.variants?.[0]?.prices?.[0]?.amount || 0,
            variantId: p.variants?.[0]?.id || "",
          }));
        setSuggestions(products);
        // Select all by default
        setSelected(new Set(products.map((p: BundleProduct) => p.id)));
      })
      .catch(() => {});
  }, [currentProductId]);

  if (suggestions.length === 0) return null;

  const selectedProducts = suggestions.filter((p) => selected.has(p.id));
  const totalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const discountedPrice = Math.round(totalPrice * (1 - discountPercent / 100));
  const savings = totalPrice - discountedPrice;

  const toggleProduct = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBuyAll = async () => {
    for (const product of selectedProducts) {
      if (product.variantId) {
        await addItem(product.variantId, 1);
      }
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div style={{
      marginTop: 24,
      padding: 20,
      border: "2px solid var(--primary-color, #1e2d7d)",
      borderRadius: 12,
      background: "#fafbff",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>🤝</span>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#202223" }}>
          Compre junto e ganhe {discountPercent}% OFF
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {suggestions.map((product) => (
          <label
            key={product.id}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 8,
              background: selected.has(product.id) ? "#fff" : "#f9fafb",
              border: `1px solid ${selected.has(product.id) ? "var(--primary-color, #1e2d7d)" : "#e5e7eb"}`,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <input
              type="checkbox"
              checked={selected.has(product.id)}
              onChange={() => toggleProduct(product.id)}
              style={{ width: 18, height: 18 }}
            />
            <div style={{ width: 44, height: 44, borderRadius: 6, background: "#f0f0f0", overflow: "hidden", flexShrink: 0 }}>
              {product.thumbnail ? (
                <img src={product.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.title}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary-color, #1e2d7d)" }}>{formatMoney(product.price)}</div>
            </div>
          </label>
        ))}
      </div>

      {selectedProducts.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Subtotal ({selectedProducts.length} itens):</span>
            <span style={{ fontSize: 13, color: "#6b7280", textDecoration: "line-through" }}>{formatMoney(totalPrice)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>Com desconto ({discountPercent}% OFF):</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#16a34a" }}>{formatMoney(discountedPrice)}</span>
          </div>
          <div style={{ fontSize: 12, color: "#16a34a", marginBottom: 12 }}>
            Economia de {formatMoney(savings)}
          </div>

          {added ? (
            <div style={{ textAlign: "center", padding: "12px", background: "#f0fdf4", borderRadius: 8, fontWeight: 600, color: "#16a34a", fontSize: 14 }}>
              ✓ Adicionados ao carrinho!
            </div>
          ) : (
            <button
              onClick={handleBuyAll}
              disabled={loading}
              style={{
                width: "100%", padding: "12px",
                background: "var(--primary-color, #1e2d7d)", color: "#fff",
                border: "none", borderRadius: 8,
                fontWeight: 700, fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Adicionando..." : `Comprar junto — ${formatMoney(discountedPrice)}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
