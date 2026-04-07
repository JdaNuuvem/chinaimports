"use client";

import { useState } from "react";

interface ReviewPhoto {
  url: string;
  author: string;
  rating: number;
}

interface ReviewPhotoGalleryProps {
  photos: ReviewPhoto[];
}

export default function ReviewPhotoGallery({ photos }: ReviewPhotoGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
          Fotos de clientes ({photos.length})
        </h4>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setLightbox(index)}
              style={{
                width: 72, height: 72, borderRadius: 8,
                overflow: "hidden", border: "2px solid #e5e7eb",
                cursor: "pointer", flexShrink: 0, padding: 0,
                background: "none",
              }}
            >
              <img
                src={photo.url}
                alt={`Foto de ${photo.author}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && photos[lightbox] && (
        <>
          <div
            onClick={() => setLightbox(null)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.85)", zIndex: 9998,
            }}
          />
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999, maxWidth: "90vw", maxHeight: "90vh",
          }}>
            <img
              src={photos[lightbox].url}
              alt=""
              style={{
                maxWidth: "100%", maxHeight: "80vh",
                borderRadius: 12, display: "block",
              }}
            />
            <div style={{
              textAlign: "center", marginTop: 12, color: "#fff",
            }}>
              <div style={{ display: "flex", gap: 2, justifyContent: "center", marginBottom: 4 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} style={{ color: s <= photos[lightbox].rating ? "#f59e0b" : "#6b7280" }}>★</span>
                ))}
              </div>
              <span style={{ fontSize: 13 }}>por {photos[lightbox].author}</span>
            </div>

            {/* Navigation */}
            <div style={{
              position: "absolute", top: "50%", left: -50,
              transform: "translateY(-50%)",
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(Math.max(0, lightbox - 1)); }}
                disabled={lightbox === 0}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)", border: "none",
                  color: "#fff", fontSize: 18, cursor: lightbox === 0 ? "not-allowed" : "pointer",
                  opacity: lightbox === 0 ? 0.3 : 1,
                }}
              >
                ‹
              </button>
            </div>
            <div style={{
              position: "absolute", top: "50%", right: -50,
              transform: "translateY(-50%)",
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(Math.min(photos.length - 1, lightbox + 1)); }}
                disabled={lightbox === photos.length - 1}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)", border: "none",
                  color: "#fff", fontSize: 18, cursor: lightbox === photos.length - 1 ? "not-allowed" : "pointer",
                  opacity: lightbox === photos.length - 1 ? 0.3 : 1,
                }}
              >
                ›
              </button>
            </div>

            <button
              onClick={() => setLightbox(null)}
              style={{
                position: "absolute", top: -40, right: 0,
                background: "none", border: "none", color: "#fff",
                fontSize: 24, cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </>
      )}
    </>
  );
}
