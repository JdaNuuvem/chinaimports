"use client";
import { useState, useEffect } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        .back-to-top-btn { position: fixed; bottom: 80px; right: 20px; z-index: 999; }
        @media (max-width: 768px) {
          .back-to-top-btn { bottom: 148px; }
        }
      `}</style>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Voltar ao topo"
        className="back-to-top-btn"
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "var(--accent-color, #00badb)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          transition: "opacity 0.3s",
        }}
      >
        ↑
      </button>
    </>
  );
}
