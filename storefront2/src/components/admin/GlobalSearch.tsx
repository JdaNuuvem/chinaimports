"use client";
import { useState, useEffect, useRef } from "react";

interface SearchResult {
  type: "product" | "order" | "collection";
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export default function GlobalSearch({ backendUrl, token, onNavigate }: { backendUrl: string; token?: string; onNavigate: (tab: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Search
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }

    const timer = setTimeout(async () => {
      const items: SearchResult[] = [];
      try {
        // Search products
        const prodRes = await fetch(`${backendUrl}/store/products/search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: query }) });
        const prodData = await prodRes.json();
        (prodData.hits || []).slice(0, 5).forEach((p: { id: string; title: string; handle: string }) => {
          items.push({ type: "product", id: p.id, title: p.title, subtitle: `/product/${p.handle}`, icon: "📦" });
        });

        // Search orders by display ID
        if (/^\d+$/.test(query)) {
          const orderRes = await fetch(`${backendUrl}/admin/orders`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
          const orderData = await orderRes.json();
          (orderData.orders || []).filter((o: { displayId: number }) => String(o.displayId).includes(query)).slice(0, 3).forEach((o: { id: string; displayId: number; total: number }) => {
            items.push({ type: "order", id: o.id, title: `Pedido #${o.displayId}`, subtitle: `R$ ${(o.total / 100).toFixed(2)}`, icon: "📋" });
          });
        }

        // Search collections
        const colRes = await fetch(`${backendUrl}/store/collections`);
        const colData = await colRes.json();
        (colData.collections || []).filter((c: { title: string }) => c.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3).forEach((c: { id: string; title: string; handle: string }) => {
          items.push({ type: "collection", id: c.id, title: c.title, subtitle: `/collections/${c.handle}`, icon: "📁" });
        });
      } catch {}
      setResults(items);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, backendUrl]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === "product") onNavigate("products-list");
    else if (result.type === "order") onNavigate("orders-list");
    else if (result.type === "collection") onNavigate("collections-list");
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Trigger */}
      <button onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", border: "1px solid #c9cccf", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 12, color: "#6d7175", minWidth: 200 }}>
        <span>🔍</span>
        <span style={{ flex: 1, textAlign: "left" }}>Buscar...</span>
        <kbd style={{ fontSize: 10, background: "#f6f6f7", padding: "1px 5px", borderRadius: 3, border: "1px solid #e1e3e5" }}>⌘K</kbd>
      </button>

      {/* Modal */}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 100 }} onClick={() => setOpen(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", background: "#fff", borderRadius: 12, width: 540, maxHeight: 400, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #e1e3e5", gap: 10 }}>
              <span style={{ fontSize: 16, color: "#6d7175" }}>🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produtos, pedidos, coleções..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 15, padding: "4px 0" }}
              />
              <kbd onClick={() => setOpen(false)} style={{ fontSize: 10, background: "#f6f6f7", padding: "2px 8px", borderRadius: 4, border: "1px solid #e1e3e5", cursor: "pointer" }}>ESC</kbd>
            </div>
            {results.length > 0 && (
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {results.map((r) => (
                  <button key={`${r.type}-${r.id}`} onClick={() => handleSelect(r)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 16px", border: "none", borderBottom: "1px solid #f6f6f7", cursor: "pointer", background: "transparent", textAlign: "left", fontSize: 13 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f6f6f7"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontSize: 18 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "#202223" }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: "#6d7175" }}>{r.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {query.length >= 2 && results.length === 0 && (
              <div style={{ padding: "30px 16px", textAlign: "center", color: "#6d7175", fontSize: 13 }}>
                Nenhum resultado para "{query}"
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
