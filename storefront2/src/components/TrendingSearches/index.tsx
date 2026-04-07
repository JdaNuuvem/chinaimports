"use client";

import { useState, useEffect } from "react";

interface TrendingSearchesProps {
  onSelect: (term: string) => void;
}

const TRENDING_TERMS = [
  "camiseta", "tênis", "bermuda", "legging", "mochila",
  "regata", "boné", "meias", "jaqueta", "shorts",
];

export default function TrendingSearches({ onSelect }: TrendingSearchesProps) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("recent_searches");
    if (stored) {
      try { setRecent(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem("recent_searches");
  };

  return (
    <div style={{ padding: "12px 0" }}>
      {/* Recent searches */}
      {recent.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Buscas recentes
            </span>
            <button onClick={clearRecent} style={{ fontSize: 11, color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>
              Limpar
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {recent.slice(0, 6).map((term) => (
              <button
                key={term}
                onClick={() => onSelect(term)}
                style={{
                  padding: "6px 12px", borderRadius: 20,
                  border: "1px solid #e5e7eb", background: "#fff",
                  fontSize: 12, cursor: "pointer", color: "#374151",
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                <span style={{ fontSize: 10, color: "#9ca3af" }}>🕐</span>
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending */}
      <div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 }}>
          Em alta 🔥
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TRENDING_TERMS.slice(0, 8).map((term, i) => (
            <button
              key={term}
              onClick={() => onSelect(term)}
              style={{
                padding: "6px 12px", borderRadius: 20,
                border: "1px solid #e5e7eb",
                background: i < 3 ? "#fef3c7" : "#fff",
                fontSize: 12, cursor: "pointer",
                color: i < 3 ? "#92400e" : "#374151",
                fontWeight: i < 3 ? 600 : 400,
              }}
            >
              {i < 3 && <span style={{ fontSize: 10, marginRight: 4 }}>🔥</span>}
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Saves a search term to recent searches in localStorage.
 */
export function saveRecentSearch(term: string) {
  if (!term.trim()) return;
  const stored = localStorage.getItem("recent_searches");
  const recent: string[] = stored ? JSON.parse(stored) : [];
  const filtered = recent.filter((t) => t.toLowerCase() !== term.toLowerCase());
  const updated = [term.trim(), ...filtered].slice(0, 10);
  localStorage.setItem("recent_searches", JSON.stringify(updated));
}
