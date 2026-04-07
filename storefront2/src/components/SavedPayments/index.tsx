"use client";

import { useState } from "react";

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const BRAND_ICONS: Record<string, string> = {
  visa: "💳",
  mastercard: "💳",
  elo: "💳",
  amex: "💳",
  pix: "🏦",
};

interface SavedPaymentsProps {
  cards?: SavedCard[];
  onSelect?: (cardId: string) => void;
}

export default function SavedPayments({ cards = [], onSelect }: SavedPaymentsProps) {
  const [selected, setSelected] = useState<string | null>(
    cards.find((c) => c.isDefault)?.id || null
  );

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect?.(id);
  };

  if (cards.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
        <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>💳</span>
        Nenhum método de pagamento salvo.
        <p style={{ fontSize: 12, marginTop: 8 }}>
          Seus cartões serão salvos automaticamente após a primeira compra.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Métodos de Pagamento</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleSelect(card.id)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 8,
              border: `2px solid ${selected === card.id ? "var(--primary-color, #1e2d7d)" : "#e5e7eb"}`,
              background: selected === card.id ? "#eef2ff" : "#fff",
              cursor: "pointer", width: "100%", textAlign: "left",
            }}
          >
            <span style={{ fontSize: 24 }}>{BRAND_ICONS[card.brand.toLowerCase()] || "💳"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {card.brand.toUpperCase()} •••• {card.last4}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Expira {String(card.expMonth).padStart(2, "0")}/{card.expYear}
              </div>
            </div>
            {card.isDefault && (
              <span style={{
                padding: "2px 8px", borderRadius: 4,
                background: "#dbeafe", color: "#1e40af",
                fontSize: 10, fontWeight: 600,
              }}>
                Padrão
              </span>
            )}
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              border: `2px solid ${selected === card.id ? "var(--primary-color, #1e2d7d)" : "#d1d5db"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {selected === card.id && (
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: "var(--primary-color, #1e2d7d)",
                }} />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
