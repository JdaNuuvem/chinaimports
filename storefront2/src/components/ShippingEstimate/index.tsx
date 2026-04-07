"use client";
import { useState } from "react";

interface Quote {
  carrier: string;
  service: string;
  price: number;
  days: string;
}

export default function ShippingEstimate() {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [error, setError] = useState<string | null>(null);

  const formatCep = (v: string) => v.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");

  const handleQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      setError("CEP inválido");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Try real backend first
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      const res = await fetch(`${backendUrl}/store/shipping/quote?cep=${clean}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.quotes) && data.quotes.length > 0) {
          setQuotes(data.quotes);
          return;
        }
      }
      // Fallback: deterministic mock based on CEP
      const region = parseInt(clean[0], 10);
      const base = 1500 + region * 350;
      setQuotes([
        { carrier: "Correios", service: "PAC", price: base, days: `${5 + region}-${8 + region} dias úteis` },
        { carrier: "Correios", service: "SEDEX", price: base + 1200, days: `${2 + region}-${4 + region} dias úteis` },
      ]);
    } catch {
      setError("Não foi possível consultar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 20, padding: "14px 16px", border: "1px solid #e5e7eb", borderRadius: 10, background: "#fafafa" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1c1e" }}>Calcular frete e prazo</span>
      </div>

      <form onSubmit={handleQuote} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          inputMode="numeric"
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          placeholder="00000-000"
          maxLength={9}
          aria-label="CEP"
          style={{
            flex: 1, minWidth: 0,
            padding: "10px 12px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: 14,
            background: "#fff",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 18px",
            background: "#1a1c1e",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: loading ? "wait" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {loading ? "..." : "Calcular"}
        </button>
      </form>

      <a
        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-block", marginTop: 6, fontSize: 11, color: "#16a34a", textDecoration: "none" }}
      >
        Não sei meu CEP
      </a>

      {error && (
        <p style={{ marginTop: 8, fontSize: 12, color: "#dc2626" }}>{error}</p>
      )}

      {quotes.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {quotes.map((q) => (
            <div key={`${q.carrier}-${q.service}`} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 12px", background: "#fff",
              border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13,
            }}>
              <div>
                <div style={{ fontWeight: 700, color: "#1a1c1e" }}>{q.carrier} {q.service}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{q.days}</div>
              </div>
              <div style={{ fontWeight: 800, color: "#16a34a" }}>
                {(q.price / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
