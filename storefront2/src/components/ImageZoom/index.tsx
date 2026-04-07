"use client";

import { useState, useRef } from "react";

interface ImageZoomProps {
  src: string;
  alt: string;
  zoomScale?: number;
}

export default function ImageZoom({ src, alt, zoomScale = 2.5 }: ImageZoomProps) {
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: zoomed ? "zoom-out" : "zoom-in",
        borderRadius: 8,
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          display: "block",
          transform: zoomed ? `scale(${zoomScale})` : "scale(1)",
          transformOrigin: `${position.x}% ${position.y}%`,
          transition: zoomed ? "none" : "transform 0.3s ease",
        }}
      />

      {/* Zoom indicator */}
      {!zoomed && (
        <div style={{
          position: "absolute", bottom: 8, right: 8,
          background: "rgba(0,0,0,0.6)", color: "#fff",
          padding: "4px 8px", borderRadius: 4,
          fontSize: 10, display: "flex", alignItems: "center", gap: 4,
        }}>
          🔍 Passe o mouse para zoom
        </div>
      )}
    </div>
  );
}
