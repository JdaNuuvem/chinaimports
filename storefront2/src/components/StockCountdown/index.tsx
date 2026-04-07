"use client";

import { useState, useEffect } from "react";

interface Props {
  quantity: number;
  threshold?: number;
}

export default function StockCountdown({ quantity, threshold = 10 }: Props) {
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    // Simulated "people viewing" count (realistic feel)
    setViewCount(Math.floor(Math.random() * 15) + 5);
    const interval = setInterval(() => {
      setViewCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(3, Math.min(25, prev + delta));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (quantity <= 0 || quantity > threshold) return null;

  return (
    <div style={{
      background: "#fff7ed",
      border: "1px solid #fed7aa",
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 16 }}>🔥</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#c2410c" }}>
          Últimas {quantity} unidades!
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#16a34a",
          animation: "pulse 2s infinite",
        }} />
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          {viewCount} pessoas estão vendo este produto agora
        </span>
      </div>
      {/* Progress bar showing how much stock is left */}
      <div style={{ marginTop: 8, background: "#fed7aa", borderRadius: 4, height: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          background: quantity <= 3 ? "#dc2626" : "#f97316",
          borderRadius: 4,
          width: `${Math.max(5, (quantity / threshold) * 100)}%`,
          transition: "width 0.5s",
        }} />
      </div>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }" }} />
    </div>
  );
}
