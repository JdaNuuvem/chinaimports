"use client";

import { useState, useEffect } from "react";

interface SoldCounterProps {
  productId: string;
  baseSold?: number;
}

export default function SoldCounter({ productId, baseSold = 0 }: SoldCounterProps) {
  const [sold, setSold] = useState(baseSold);

  useEffect(() => {
    // Fetch real sold count or use simulated count
    if (baseSold > 0) { setSold(baseSold); return; }
    // Simulate a sold count based on product ID hash
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = ((hash << 5) - hash) + productId.charCodeAt(i);
      hash |= 0;
    }
    setSold(Math.abs(hash % 500) + 50);
  }, [productId, baseSold]);

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 13, color: "#6b7280",
    }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 8px", borderRadius: 4,
        background: "#dbeafe", color: "#1e40af",
        fontSize: 12, fontWeight: 600,
      }}>
        Novo
      </span>
      <span>|</span>
      <span style={{ fontWeight: 600, color: "#374151" }}>{sold.toLocaleString("pt-BR")} vendidos</span>
    </div>
  );
}
