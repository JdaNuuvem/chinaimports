"use client";

import { useState, useRef } from "react";

interface ProductCarouselProps {
  title: string;
  children: React.ReactNode;
  viewAllLink?: string;
}

export default function ProductCarousel({ title, children, viewAllLink }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h2>
        {viewAllLink && (
          <a href={viewAllLink} style={{ fontSize: 13, color: "var(--primary-color, #1e2d7d)", textDecoration: "none", fontWeight: 600 }}>
            Ver todos →
          </a>
        )}
      </div>

      <div style={{ position: "relative" }}>
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            style={{
              position: "absolute", left: -16, top: "50%", transform: "translateY(-50%)",
              width: 36, height: 36, borderRadius: "50%",
              background: "#fff", border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              cursor: "pointer", fontSize: 16, zIndex: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ‹
          </button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            style={{
              position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)",
              width: 36, height: 36, borderRadius: "50%",
              background: "#fff", border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              cursor: "pointer", fontSize: 16, zIndex: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ›
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          style={{
            display: "flex", gap: 16,
            overflowX: "auto", scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingBottom: 4,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
