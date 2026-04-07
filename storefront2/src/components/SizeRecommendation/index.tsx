"use client";

import { useState, useEffect } from "react";

interface SizeRecommendationProps {
  productType?: string; // "camiseta", "calca", "tenis"
  availableSizes: string[];
}

interface SizeHistory {
  size: string;
  productType: string;
  date: string;
}

const STORAGE_KEY = "size_history";

export function saveSizeChoice(size: string, productType: string) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const history: SizeHistory[] = stored ? JSON.parse(stored) : [];
  history.unshift({ size, productType, date: new Date().toISOString() });
  // Keep last 20
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
}

export default function SizeRecommendation({ productType, availableSizes }: SizeRecommendationProps) {
  const [recommendation, setRecommendation] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const history: SizeHistory[] = JSON.parse(stored);
    if (history.length === 0) return;

    // Find most common size for this product type, or overall
    const relevant = productType
      ? history.filter((h) => h.productType.toLowerCase() === productType.toLowerCase())
      : history;

    const pool = relevant.length > 0 ? relevant : history;

    // Count frequencies
    const freq: Record<string, number> = {};
    for (const h of pool) {
      freq[h.size] = (freq[h.size] || 0) + 1;
    }

    // Find most common that's available
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    for (const [size] of sorted) {
      if (availableSizes.some((s) => s.toLowerCase() === size.toLowerCase())) {
        setRecommendation(size);
        break;
      }
    }
  }, [productType, availableSizes]);

  if (!recommendation) return null;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 12px", borderRadius: 20,
      background: "#dbeafe", border: "1px solid #93c5fd",
      fontSize: 12, color: "#1e40af", fontWeight: 500,
      marginBottom: 8,
    }}>
      <span>👤</span>
      Seu tamanho habitual: <strong>{recommendation}</strong>
    </div>
  );
}
