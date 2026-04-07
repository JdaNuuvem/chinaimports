"use client";

import { useState } from "react";

interface PriceDropAlertProps {
  productId: string;
  productTitle: string;
  currentPrice: number;
}

export default function PriceDropAlert({ productId, productTitle, currentPrice }: PriceDropAlertProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Store alert in localStorage
    const alerts = JSON.parse(localStorage.getItem("price_alerts") || "[]");
    alerts.push({
      productId,
      productTitle,
      currentPrice,
      email,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("price_alerts", JSON.stringify(alerts));

    // Also send to backend
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    fetch(`${backendUrl}/store/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, tags: `price_alert:${productId}` }),
    }).catch(() => {});

    setSubmitted(true);
    setTimeout(() => { setOpen(false); setSubmitted(false); }, 3000);
  };

  return (
    <div style={{ marginTop: 8 }}>
      {!open && !submitted && (
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, color: "var(--primary-color, #1e2d7d)",
            fontWeight: 600, padding: 0,
          }}
        >
          🔔 Avise-me quando o preço baixar
        </button>
      )}

      {open && !submitted && (
        <form onSubmit={handleSubmit} style={{
          display: "flex", gap: 8, alignItems: "center",
          animation: "fadeIn 0.2s ease-out",
        }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu e-mail"
            style={{
              flex: 1, padding: "8px 12px",
              border: "1px solid var(--border-color, #e1e3e5)",
              borderRadius: 6, fontSize: 13,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 14px", fontSize: 12, fontWeight: 600,
              background: "var(--primary-color, #1e2d7d)", color: "#fff",
              border: "none", borderRadius: 6, cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Ativar alerta
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14 }}
          >
            ✕
          </button>
        </form>
      )}

      {submitted && (
        <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
          ✓ Alerta ativado! Avisaremos quando o preço baixar.
        </p>
      )}
    </div>
  );
}
