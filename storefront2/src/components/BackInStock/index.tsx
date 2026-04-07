"use client";

import { useState } from "react";

interface BackInStockProps {
  productId: string;
  productTitle: string;
  variantTitle?: string;
}

export default function BackInStock({ productId, productTitle, variantTitle }: BackInStockProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Store locally
    const alerts = JSON.parse(localStorage.getItem("back_in_stock_alerts") || "[]");
    alerts.push({ productId, productTitle, variantTitle, email, createdAt: new Date().toISOString() });
    localStorage.setItem("back_in_stock_alerts", JSON.stringify(alerts));

    // Send to backend
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    try {
      await fetch(`${backendUrl}/store/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tags: `back_in_stock:${productId}` }),
      });
    } catch { /* fire and forget */ }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{
        background: "#f0fdf4", border: "1px solid #bbf7d0",
        borderRadius: 8, padding: "14px 16px", marginTop: 12,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 18 }}>✅</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#16a34a", margin: 0 }}>Alerta ativado!</p>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>Avisaremos em <strong>{email}</strong> quando voltar ao estoque.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#fef2f2", border: "1px solid #fecaca",
      borderRadius: 8, padding: "16px", marginTop: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>🔔</span>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", margin: 0 }}>Produto esgotado</p>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>
            {variantTitle ? `Variante: ${variantTitle}` : "Cadastre-se para ser avisado quando voltar"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu e-mail"
          style={{
            flex: 1, padding: "10px 12px",
            border: "1px solid #fecaca", borderRadius: 6,
            fontSize: 13, background: "#fff",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 16px", borderRadius: 6,
            background: "#dc2626", color: "#fff",
            border: "none", fontWeight: 700, fontSize: 13,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          Avise-me
        </button>
      </form>
      {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{error}</p>}
    </div>
  );
}
