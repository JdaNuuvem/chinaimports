"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, SearchIcon } from "@/components/Icons";
import { saveRecentSearch } from "@/components/TrendingSearches";
import { trackSearch } from "@/lib/sentinel";

interface SearchBarProps {
  onClose: () => void;
}

interface SearchSuggestion {
  title: string;
  handle: string;
  thumbnail: string | null;
  price: number;
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem("recent_searches");
    if (stored) {
      try { setRecentSearches(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  // Autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
        const res = await fetch(`${backendUrl}/store/search?q=${encodeURIComponent(query)}&limit=8`);
        const data = await res.json();
        const hits = (data.hits || data.products || []).slice(0, 6).map((p: { title: string; handle: string; thumbnail: string | null; variants?: Array<{ prices?: Array<{ amount: number }> }> }) => ({
          title: p.title,
          handle: p.handle,
          thumbnail: p.thumbnail,
          price: p.variants?.[0]?.prices?.[0]?.amount || 0,
        }));
        setSuggestions(hits);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIdx >= 0 && suggestions[selectedIdx]) {
      navigate(suggestions[selectedIdx].handle);
      return;
    }
    if (query.trim()) {
      saveRecentSearch(query.trim());
      trackSearch(query.trim(), suggestions.length);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const navigate = (handle: string) => {
    saveRecentSearch(query.trim());
    router.push(`/product/${handle}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const showSuggestions = suggestions.length > 0;
  const showRecent = !query && recentSearches.length > 0;

  return (
    <div className="search-bar-overlay">
      <div className="search-bar">
        <div className="container">
          <form onSubmit={handleSubmit} className="search-bar__form">
            <SearchIcon className="w-5 h-5 search-bar__icon" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIdx(-1); }}
              onKeyDown={handleKeyDown}
              placeholder="Pesquisar produtos..."
              className="search-bar__input"
              autoFocus
            />
            {loading && <span style={{ fontSize: 12, color: "#9ca3af" }}>...</span>}
            <button type="button" onClick={onClose} className="search-bar__close" aria-label="Fechar">
              <CloseIcon className="w-5 h-5" />
            </button>
          </form>

          {/* Autocomplete suggestions */}
          {showSuggestions && (
            <div style={{ marginTop: 8, background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              {suggestions.map((s, i) => (
                <button
                  key={s.handle}
                  onClick={() => navigate(s.handle)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    width: "100%", padding: "10px 14px", border: "none",
                    background: i === selectedIdx ? "#f0f0f0" : "transparent",
                    cursor: "pointer", textAlign: "left",
                    borderBottom: i < suggestions.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 4, background: "#f0f0f0", overflow: "hidden", flexShrink: 0 }}>
                    {s.thumbnail ? (
                      <img src={s.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📦</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#202223", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.title}</div>
                    {s.price > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary-color, #1e2d7d)" }}>R$ {(s.price / 100).toFixed(2).replace(".", ",")}</div>}
                  </div>
                </button>
              ))}
              <button
                onClick={handleSubmit}
                style={{ width: "100%", padding: "10px 14px", border: "none", background: "#f9fafb", cursor: "pointer", fontSize: 13, color: "var(--primary-color, #1e2d7d)", fontWeight: 600, textAlign: "center" }}
              >
                Ver todos os resultados para &ldquo;{query}&rdquo; →
              </button>
            </div>
          )}

          {/* Recent searches */}
          {showRecent && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Buscas recentes</span>
                <button onClick={() => { localStorage.removeItem("recent_searches"); setRecentSearches([]); }} style={{ fontSize: 11, color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>Limpar</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {recentSearches.slice(0, 6).map((term) => (
                  <button key={term} onClick={() => { setQuery(term); }} style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, cursor: "pointer", color: "#374151" }}>
                    🕐 {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .search-bar-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          display: flex;
          align-items: flex-start;
        }
        .search-bar {
          width: 100%;
          background: var(--background, #fff);
          padding: 20px 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .search-bar__form {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .search-bar__input {
          flex: 1;
          border: none;
          font-size: 18px;
          padding: 10px 0;
          outline: none;
          font-family: var(--text-font-family);
          color: var(--text-color);
        }
        .search-bar__close { background: none; border: none; cursor: pointer; }
      `}</style>
    </div>
  );
}
