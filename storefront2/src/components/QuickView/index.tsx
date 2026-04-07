"use client";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/utils";
import InstallmentDisplay from "@/components/InstallmentDisplay";
import type { Product } from "@/lib/medusa-client";

interface QuickViewProps {
  product: Product;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: QuickViewProps) {
  const { addItem, loading } = useCart();
  const variant = product.variants?.[0];
  const price = variant?.prices?.[0]?.amount ?? 0;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative", background: "#fff", borderRadius: 12,
          maxWidth: 700, width: "90%", maxHeight: "80vh", overflow: "auto",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Image */}
        <div style={{ padding: 20 }}>
          <img
            src={product.thumbnail || "https://placehold.co/400x400"}
            alt={product.title}
            style={{ width: "100%", borderRadius: 8, objectFit: "cover" }}
          />
        </div>

        {/* Info */}
        <div style={{ padding: "30px 30px 30px 10px" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#888" }}>×</button>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{product.title}</h2>

          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>{formatMoney(price)}</span>
            <InstallmentDisplay price={price} />
          </div>

          <p style={{ fontSize: 14, color: "var(--text-color)", lineHeight: 1.6, marginBottom: 20, maxHeight: 100, overflow: "hidden" }}>
            {product.description?.slice(0, 200)}...
          </p>

          <button
            onClick={() => variant && addItem(variant.id, 1)}
            disabled={loading}
            className="button button--primary"
            style={{ width: "100%", padding: "12px", fontWeight: 700 }}
          >
            {loading ? "Adicionando..." : "Adicionar ao carrinho"}
          </button>

          <a
            href={`/product/${product.handle}`}
            style={{ display: "block", textAlign: "center", marginTop: 12, color: "var(--link-color)", fontSize: 14 }}
          >
            Ver detalhes completos →
          </a>
        </div>
      </div>
    </div>
  );
}
