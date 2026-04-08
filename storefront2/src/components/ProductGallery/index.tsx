"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: Array<{ id: string; url: string }>;
  productTitle: string;
  discount?: number;
}

export default function ProductGallery({ images, productTitle, discount }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const touchStartX = useRef(0);
  const currentImage = images[selectedIndex]?.url || "https://placehold.co/600x600/f5f5f5/999?text=Sem+Imagem";
  const hasMultiple = images.length > 1;

  const goTo = (i: number) => {
    setSelectedIndex(i);
    setFadeKey((k) => k + 1);
  };
  const goPrev = () => goTo(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  const goNext = () => goTo(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);

  // Swipe support
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? goNext() : goPrev(); }
  };

  // Image counter "1/14" style
  const counterText = `${selectedIndex + 1}/${images.length}`;

  // Lock scroll while lightbox open + keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  const onMouseMoveZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes galleryFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .gallery-img-fade { animation: galleryFadeIn 0.3s ease-out; }
        .discount-badge-anim { animation: badgePulse 2s ease-in-out infinite; }
        .gallery-arrow { transition: all 0.2s; }
        .gallery-arrow:hover { background: rgba(255,255,255,1) !important; transform: translateY(-50%) scale(1.1); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .gallery-arrow:active { transform: translateY(-50%) scale(0.95); }
        .product-thumbs-row::-webkit-scrollbar { display: none; }
        .thumb-btn { transition: opacity 0.2s, border-color 0.2s, transform 0.2s; }
        .thumb-btn:hover { opacity: 1 !important; transform: scale(1.05); }
      `}} />

      {/* Main image container */}
      <div
        style={{ position: "relative", background: "#fff", borderRadius: 8, overflow: "hidden" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Discount badge */}
        {discount != null && discount > 0 && (
          <div className="discount-badge-anim" style={{
            position: "absolute", top: 12, left: 12, zIndex: 2,
            background: "#16a34a", color: "#fff",
            padding: "4px 12px", borderRadius: 6,
            fontSize: 14, fontWeight: 700,
          }}>
            -{discount}%
          </div>
        )}

        {/* Image counter */}
        {hasMultiple && (
          <div style={{
            position: "absolute", top: 12, right: 12, zIndex: 2,
            background: "rgba(0,0,0,0.6)", color: "#fff",
            padding: "3px 10px", borderRadius: 12,
            fontSize: 12, fontWeight: 600,
          }}>
            {counterText}
          </div>
        )}

        {/* Main image with fade animation + click-to-expand + hover zoom */}
        <div
          key={fadeKey}
          className="gallery-img-fade"
          onClick={() => setLightboxOpen(true)}
          onMouseMove={onMouseMoveZoom}
          onMouseLeave={() => setZoomPos(null)}
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1/1",
            cursor: "zoom-in",
            overflow: "hidden",
          }}
        >
          <Image
            src={currentImage}
            alt={productTitle}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{
              objectFit: "contain",
              transform: zoomPos ? "scale(1.8)" : "scale(1)",
              transformOrigin: zoomPos ? `${zoomPos.x}% ${zoomPos.y}%` : "center",
              transition: zoomPos ? "transform 0.05s linear" : "transform 0.2s ease",
            }}
          />
        </div>

        {/* Prev/Next arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={goPrev}
              className="gallery-arrow"
              aria-label="Imagem anterior"
              style={{
                position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.85)", border: "1px solid #e5e7eb",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "#374151", zIndex: 2,
              }}
            >
              &#8249;
            </button>
            <button
              onClick={goNext}
              className="gallery-arrow"
              aria-label="Próxima imagem"
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.85)", border: "1px solid #e5e7eb",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: "#374151", zIndex: 2,
              }}
            >
              &#8250;
            </button>
          </>
        )}

        {/* Dots */}
        {hasMultiple && (
          <div style={{
            position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 6, zIndex: 2,
          }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Imagem ${i + 1}`}
                style={{
                  width: i === selectedIndex ? 10 : 8,
                  height: i === selectedIndex ? 10 : 8,
                  borderRadius: "50%",
                  background: i === selectedIndex ? "#1a1c1e" : "rgba(0,0,0,0.25)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — fullscreen view */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.94)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            aria-label="Fechar"
            style={{
              position: "absolute", top: 16, right: 20,
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%", width: 44, height: 44,
              color: "#fff", fontSize: 24, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
            }}
          >×</button>

          {hasMultiple && (
            <div style={{ position: "absolute", top: 24, left: 24, color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600 }}>
              {selectedIndex + 1} / {images.length}
            </div>
          )}

          {hasMultiple && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Anterior"
              style={{
                position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%", width: 48, height: 48,
                color: "#fff", fontSize: 28, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
              }}
            >‹</button>
          )}

          <img
            src={currentImage}
            alt={productTitle}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(92vw, 1200px)",
              maxHeight: "88vh",
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          />

          {hasMultiple && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Próxima"
              style={{
                position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%", width: 48, height: 48,
                color: "#fff", fontSize: 28, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
              }}
            >›</button>
          )}
        </div>
      )}

      {/* Horizontal thumbnails */}
      {hasMultiple && (
        <div
          className="product-thumbs-row"
          style={{
            display: "flex", gap: 8, overflowX: "auto",
            scrollbarWidth: "none", paddingBottom: 4,
          }}
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              className="thumb-btn"
              onClick={() => goTo(i)}
              style={{
                width: 64, height: 64, flexShrink: 0,
                border: i === selectedIndex ? "2px solid #16a34a" : "1px solid #e5e7eb",
                borderRadius: 6, overflow: "hidden",
                cursor: "pointer", padding: 0, background: "#fff",
                opacity: i === selectedIndex ? 1 : 0.7,
              }}
            >
              <img
                src={img.url}
                alt={`${productTitle} - ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
