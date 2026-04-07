"use client";

import { useState, useEffect } from "react";
import { formatMoney } from "@/lib/utils";

interface CompareProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price: number;
  compareAtPrice?: number | null;
  description?: string;
  variants?: Array<{ title: string; inventory_quantity: number }>;
}

const MAX_COMPARE = 3;
const STORAGE_KEY = "compare_products";

export function useComparison() {
  const [products, setProducts] = useState<CompareProduct[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setProducts(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const add = (product: CompareProduct) => {
    setProducts((prev) => {
      if (prev.length >= MAX_COMPARE) return prev;
      if (prev.some((p) => p.id === product.id)) return prev;
      const next = [...prev, product];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const remove = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clear = () => {
    setProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const has = (id: string) => products.some((p) => p.id === id);

  return { products, add, remove, clear, has };
}

export function CompareButton({ product, onAdd, isAdded }: { product: CompareProduct; onAdd: (p: CompareProduct) => void; isAdded: boolean }) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!isAdded) onAdd(product); }}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "4px 10px", borderRadius: 4, border: "1px solid",
        borderColor: isAdded ? "#16a34a" : "#e1e3e5",
        background: isAdded ? "#f0fdf4" : "#fff",
        color: isAdded ? "#16a34a" : "#6b7280",
        fontSize: 11, cursor: isAdded ? "default" : "pointer",
        fontWeight: 600,
      }}
    >
      {isAdded ? "✓ Comparando" : "⚖ Comparar"}
    </button>
  );
}

export default function ProductComparisonDrawer({ products, onRemove, onClear }: { products: CompareProduct[]; onRemove: (id: string) => void; onClear: () => void }) {
  if (products.length === 0) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#fff", borderTop: "2px solid var(--primary-color, #1e2d7d)",
      boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
      zIndex: 990, padding: "12px 20px",
      animation: "slideUp 0.3s ease-out",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Comparar ({products.length}/{MAX_COMPARE})</span>
          {products.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f9fafb", borderRadius: 8, padding: "6px 10px" }}>
              {p.thumbnail && <img src={p.thumbnail} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: "cover" }} />}
              <span style={{ fontSize: 12, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
              <button onClick={() => onRemove(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53e3e", fontSize: 12 }}>✕</button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {products.length >= 2 && (
            <a
              href={`/compare?ids=${products.map((p) => p.id).join(",")}`}
              style={{
                padding: "8px 20px", borderRadius: 6, fontSize: 13, fontWeight: 700,
                background: "var(--primary-color, #1e2d7d)", color: "#fff",
                textDecoration: "none",
              }}
            >
              Comparar agora
            </a>
          )}
          <button onClick={onClear} style={{ padding: "8px 14px", borderRadius: 6, fontSize: 12, border: "1px solid #e1e3e5", background: "#fff", cursor: "pointer", color: "#6b7280" }}>
            Limpar
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }" }} />
    </div>
  );
}
