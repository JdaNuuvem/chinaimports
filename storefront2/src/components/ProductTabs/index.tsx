"use client";
import { useState, useEffect } from "react";
import ProductReviews from "@/components/ProductReviews";
import ReviewSummary from "@/components/ReviewSummary";
import ReviewPhotoGallery from "@/components/ReviewPhotoGallery";
import ProductQA from "@/components/ProductQA";
import ShippingCalculator from "@/components/ShippingCalculator";
import type { Product } from "@/lib/medusa-client";

interface ProductTabsProps {
  product: Product;
}

type Tab = "description" | "specs";

interface ReviewData {
  rating: number;
  images?: string;
  author: string;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const [reviews, setReviews] = useState<ReviewData[]>([]);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    fetch(`${backendUrl}/store/products/${product.id}/reviews`)
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => {});
  }, [product.id]);

  const reviewPhotos = reviews
    .filter((r) => r.images)
    .flatMap((r) => {
      try {
        const imgs = JSON.parse(r.images!);
        return (Array.isArray(imgs) ? imgs : [imgs]).map((url: string) => ({
          url,
          author: r.author,
          rating: r.rating,
        }));
      } catch { return []; }
    });

  const tabs: { id: Tab; label: string }[] = [
    { id: "description", label: "Descrição" },
    { id: "specs", label: "Especificações" },
  ];

  return (
    <div style={{ marginTop: 40 }}>

      {/* ── Tabs: Descrição / Especificações ── */}
      <div style={{ display: "flex", borderBottom: "2px solid var(--border-color)", gap: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "14px 24px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--accent-color)" : "2px solid transparent",
              marginBottom: -2,
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? 700 : 400,
              color: activeTab === tab.id ? "var(--heading-color)" : "var(--text-color)",
              fontSize: 15,
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px 0" }}>
        {activeTab === "description" && (
          <div className="rte" style={{ lineHeight: 1.8, fontSize: 15 }}>
            {product.description || "Sem descrição disponível."}
          </div>
        )}

        {activeTab === "specs" && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <tbody>
                {product.options?.map((opt) => (
                  <tr key={opt.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "10px 0", fontWeight: 600, width: "30%" }}>{opt.title}</td>
                    <td style={{ padding: "10px 0" }}>{opt.values.map((v) => v.value).join(", ")}</td>
                  </tr>
                ))}
                {product.variants?.[0]?.sku && (
                  <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "10px 0", fontWeight: 600 }}>SKU</td>
                    <td style={{ padding: "10px 0" }}>{product.variants[0].sku}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Avaliações (sempre visível) ── */}
      <div id="product-reviews" style={{ borderTop: "1px solid var(--border-color)", paddingTop: 32, marginTop: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          Avaliações
          {reviews.length > 0 && (
            <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-color)" }}>({reviews.length})</span>
          )}
        </h2>
        <ReviewSummary reviews={reviews} />
        <ReviewPhotoGallery photos={reviewPhotos} />
        <ProductReviews productId={product.id} />
      </div>

      {/* ── Perguntas (sempre visível) ── */}
      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 32, marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Perguntas sobre o produto</h2>
        <ProductQA productId={product.id} />
      </div>

      {/* Entrega removida — já existe acima no ProductInfo */}
    </div>
  );
}
