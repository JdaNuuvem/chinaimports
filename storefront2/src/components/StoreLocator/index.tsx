"use client";

import { useState } from "react";

interface Store {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  hours: string;
  lat?: number;
  lng?: number;
}

const STORES: Store[] = [
  { name: "Imports China Brasil Morumbi Shopping", address: "Av. Roque Petroni Júnior, 1089", city: "São Paulo", state: "SP", phone: "(11) 3048-1234", hours: "Seg-Sáb 10h-22h, Dom 14h-20h" },
  { name: "Imports China Brasil Shopping Leblon", address: "Av. Afrânio de Melo Franco, 290", city: "Rio de Janeiro", state: "RJ", phone: "(21) 3252-1234", hours: "Seg-Sáb 10h-22h, Dom 15h-21h" },
  { name: "Imports China Brasil BH Shopping", address: "Rodovia BR-356, 3049", city: "Belo Horizonte", state: "MG", phone: "(31) 3286-1234", hours: "Seg-Sáb 10h-22h, Dom 14h-20h" },
  { name: "Imports China Brasil Park Shopping Barigui", address: "Rua Prof. Pedro Viriato Parigot de Souza, 600", city: "Curitiba", state: "PR", phone: "(41) 3234-1234", hours: "Seg-Sáb 10h-22h, Dom 14h-20h" },
];

export default function StoreLocator() {
  const [search, setSearch] = useState("");
  const filtered = STORES.filter((s) =>
    !search || s.city.toLowerCase().includes(search.toLowerCase()) || s.state.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Nossas Lojas</h2>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por cidade ou estado..."
        style={{
          width: "100%", padding: "12px 14px",
          border: "1px solid var(--border-color, #e1e3e5)",
          borderRadius: 8, fontSize: 14, marginBottom: 16,
          boxSizing: "border-box",
        }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.map((store) => (
          <div key={store.name} style={{
            padding: "16px", borderRadius: 10,
            border: "1px solid #e5e7eb", background: "#fff",
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{store.name}</h3>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>📍 {store.address}</p>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>{store.city}, {store.state}</p>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}>📞 {store.phone}</p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 8px" }}>🕐 {store.hours}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address + " " + store.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block", padding: "6px 14px",
                borderRadius: 6, border: "1px solid var(--primary-color, #1e2d7d)",
                color: "var(--primary-color, #1e2d7d)",
                fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}
            >
              Ver no mapa →
            </a>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#9ca3af", padding: 24 }}>
          Nenhuma loja encontrada para &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  );
}
