"use client";
import { useState, useEffect } from "react";

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  images?: string;
  createdAt?: string;
  date?: string;
}

interface ProductReviewsProps {
  productId: string;
  reviews?: Review[];
}

function StarIcon({ filled, size = 18 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={filled ? "#f59e0b" : "#d1d5db"} xmlns="http://www.w3.org/2000/svg">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

const DEMO_REVIEWS: Review[] = [
  { id: "r1", author: "Renata C.", rating: 4, title: "Recomendo", body: "Produto muito bom, atendeu bem às minhas expectativas. Recomendo.", date: "2026-04-03" },
  { id: "r2", author: "Leonardo M.", rating: 5, title: "Muito bom", body: "Qualidade absurda, grave muito forte e não distorce nem no máximo", date: "2026-04-03" },
  { id: "r3", author: "Elizabeth M.", rating: 5, title: "Muito bom para churrasco e festa", body: "Usei na piscina sem medo, realmente resistente à água e poeira.", date: "2026-04-03" },
  { id: "r4", author: "Alexandro S.", rating: 5, title: "", body: "Peguei na promoção e valeu MUITO a pena. Produto top demais!", date: "2026-04-03" },
  { id: "r5", author: "Jefferson A.", rating: 5, title: "Melhor compra", body: "Troquei minha JBL antiga por esse, não me arrependo nem um pouco", date: "2026-04-03" },
  { id: "r6", author: "Alexandre Z.", rating: 5, title: "Recomendo", body: "Bateria dura muito! Usei dois dias e ainda sobrou carga.", date: "2026-04-03" },
  { id: "r7", author: "Edinalva P.", rating: 5, title: "Melhor compra do ano", body: "Muito potente! O grave é absurdo, treme tudo mesmo. Melhor compra que fiz.", date: "2026-04-03" },
  { id: "r8", author: "Bruno A.", rating: 4, title: "Produto ok", body: "Está ok para o preço que paguei. Poderia ser melhor em alguns detalhes.", date: "2026-04-02" },
  { id: "r9", author: "Carlos R.", rating: 5, title: "Superou minhas expectativas", body: "Já é a segunda vez que compro e continua com a mesma qualidade. Excelente!", date: "2026-03-30" },
  { id: "r10", author: "Juliana M.", rating: 5, title: "Produto perfeito", body: "Melhor custo-benefício que encontrei. Produto chegou perfeito!", date: "2026-03-28" },
  { id: "r11", author: "Beatriz P.", rating: 5, title: "Amei demais!", body: "Melhor custo-benefício que encontrei. Produto chegou perfeito!", date: "2026-03-27" },
  { id: "r12", author: "Felipe R.", rating: 5, title: "Qualidade incrível", body: "Compra perfeita do início ao fim. Produto é tudo que eu esperava e mais.", date: "2026-03-27" },
];

type ReviewSort = "recent" | "high" | "low";
type ReviewFilter = "all" | "with_photos" | "5" | "4" | "3" | "2" | "1";

export default function ProductReviews({ productId, reviews: propReviews }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(propReviews || DEMO_REVIEWS);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [sort, setSort] = useState<ReviewSort>("recent");
  const [filter, setFilter] = useState<ReviewFilter>("all");

  // Close lightbox on Escape and lock body scroll
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") setLightbox((lb) => lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : null);
      if (e.key === "ArrowRight") setLightbox((lb) => lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  useEffect(() => {
    if (propReviews) return;
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    fetch(`${backendUrl}/store/products/${productId}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews?.length > 0) setReviews(data.reviews);
      })
      .catch(() => {});
  }, [productId, propReviews]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const parseImages = (images?: string): string[] => {
    if (!images) return [];
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch { return []; }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
  };

  // Apply filter + sort
  const filteredReviews = reviews.filter((r) => {
    if (filter === "all") return true;
    if (filter === "with_photos") return parseImages(r.images).length > 0;
    return r.rating === Number(filter);
  });
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sort === "recent") {
      const da = new Date(a.date || a.createdAt || 0).getTime();
      const db = new Date(b.date || b.createdAt || 0).getTime();
      return db - da;
    }
    if (sort === "high") return b.rating - a.rating;
    if (sort === "low") return a.rating - b.rating;
    return 0;
  });

  // Aggregate all photos for the top gallery
  const allPhotos = reviews.flatMap((r) => parseImages(r.images));

  return (
    <div id="product-reviews">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes reviewSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .review-card { animation: reviewSlideUp 0.5s ease-out both; transition: box-shadow 0.25s ease, transform 0.25s ease; }
        .review-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.06); transform: translateY(-2px); }
      `}} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1c1e", margin: "0 0 8px 0" }}>
          Avaliações dos Clientes
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <StarIcon key={n} filled={n <= Math.round(Number(avgRating))} size={20} />
            ))}
          </span>
          <span style={{ fontSize: 14, color: "#6b7280" }}>
            {avgRating} de 5 ({reviews.length} avaliações)
          </span>
        </div>
      </div>

      {/* Photo gallery — all review photos in a horizontal scroll */}
      {allPhotos.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1c1e", marginBottom: 10 }}>
            Fotos dos clientes ({allPhotos.length})
          </p>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "thin" }}>
            {allPhotos.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox({ images: allPhotos, index: i })}
                aria-label={`Foto de cliente ${i + 1}`}
                style={{
                  width: 110, height: 110, flexShrink: 0,
                  borderRadius: 10, overflow: "hidden",
                  border: "1px solid #e5e7eb", padding: 0,
                  background: "#fff", cursor: "zoom-in",
                }}
              >
                <img src={img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter + sort controls */}
      {reviews.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ReviewFilter)}
            style={{
              padding: "8px 12px", borderRadius: 8,
              border: "1px solid #e5e7eb", background: "#fff",
              fontSize: 13, cursor: "pointer",
            }}
          >
            <option value="all">Todas as avaliações</option>
            <option value="with_photos">Apenas com fotos</option>
            <option value="5">5 estrelas</option>
            <option value="4">4 estrelas</option>
            <option value="3">3 estrelas</option>
            <option value="2">2 estrelas</option>
            <option value="1">1 estrela</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ReviewSort)}
            style={{
              padding: "8px 12px", borderRadius: 8,
              border: "1px solid #e5e7eb", background: "#fff",
              fontSize: 13, cursor: "pointer",
            }}
          >
            <option value="recent">Mais recentes</option>
            <option value="high">Melhor avaliação</option>
            <option value="low">Pior avaliação</option>
          </select>
          {filter !== "all" && (
            <span style={{ alignSelf: "center", fontSize: 12, color: "#6b7280" }}>
              Mostrando {sortedReviews.length} de {reviews.length}
            </span>
          )}
        </div>
      )}

      {/* Review cards — vertical list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sortedReviews.map((review, idx) => {
          const imgs = parseImages(review.images);
          const initial = review.author.charAt(0).toUpperCase();
          return (
            <div
              key={review.id}
              className="review-card"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "20px 24px",
                background: "#fff",
                animationDelay: `${Math.min(idx, 6) * 0.06}s`,
              }}
            >
              {/* Author row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                {/* Avatar initial */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#16a34a", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, flexShrink: 0,
                }}>
                  {initial}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1c1e" }}>{review.author}</span>
                    <span style={{ display: "inline-flex", gap: 1 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <StarIcon key={n} filled={n <= review.rating} size={16} />
                      ))}
                    </span>
                    <span style={{
                      background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
                      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                    }}>
                      Compra verificada
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                    {formatDate(review.date || review.createdAt)}
                  </div>
                </div>
              </div>

              {/* Title */}
              {review.title && (
                <p style={{ fontWeight: 700, fontSize: 15, color: "#1a1c1e", margin: "10px 0 4px 0" }}>
                  {review.title}
                </p>
              )}

              {/* Body */}
              <p style={{ color: "#6b7280", lineHeight: 1.6, fontSize: 14, margin: "4px 0 0 0" }}>
                {review.body}
              </p>

              {/* Images */}
              {imgs.length > 0 && (
                <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  {imgs.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightbox({ images: imgs, index: i })}
                      aria-label={`Abrir foto ${i + 1} de ${imgs.length}`}
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: 10,
                        overflow: "hidden",
                        border: "1px solid #e5e7eb",
                        padding: 0,
                        background: "#fff",
                        cursor: "zoom-in",
                        position: "relative",
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,.12)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <img
                        src={img}
                        alt={`Foto da avaliação ${i + 1}`}
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {reviews.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Nenhuma avaliação ainda</p>
          <p style={{ fontSize: 13 }}>Seja o primeiro a avaliar este produto!</p>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            aria-label="Fechar"
            style={{
              position: "absolute",
              top: 16,
              right: 20,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%",
              width: 44,
              height: 44,
              color: "#fff",
              fontSize: 24,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            ×
          </button>

          {/* Counter */}
          <div style={{ position: "absolute", top: 24, left: 24, color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }}>
            {lightbox.index + 1} / {lightbox.images.length}
          </div>

          {/* Prev */}
          {lightbox.images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox((lb) => lb ? { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length } : null); }}
              aria-label="Anterior"
              style={{
                position: "absolute",
                left: 20,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%",
                width: 48,
                height: 48,
                color: "#fff",
                fontSize: 28,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              ‹
            </button>
          )}

          {/* Image */}
          <img
            src={lightbox.images[lightbox.index]}
            alt={`Foto ${lightbox.index + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(92vw, 1200px)",
              maxHeight: "88vh",
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          />

          {/* Next */}
          {lightbox.images.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox((lb) => lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : null); }}
              aria-label="Próxima"
              style={{
                position: "absolute",
                right: 20,
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%",
                width: 48,
                height: 48,
                color: "#fff",
                fontSize: 28,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
