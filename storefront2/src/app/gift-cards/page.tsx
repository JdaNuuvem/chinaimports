"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/utils";

const GIFT_CARD_VALUES = [5000, 10000, 15000, 20000, 30000, 50000]; // centavos

export default function GiftCardsPage() {
  const { addItem } = useCart();
  const [selectedValue, setSelectedValue] = useState(10000);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderMessage, setSenderMessage] = useState("");
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would create a gift card variant and add to cart
    // For now, show success message
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="container" style={{ padding: "60px 20px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 className="heading h1">Vale-Presente</h1>
        <p style={{ color: "var(--text-color)", maxWidth: 500, margin: "12px auto 0", lineHeight: 1.6 }}>
          Presente perfeito para quem ama esportes. Escolha o valor e envie por e-mail.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        {/* Card Preview */}
        <div>
          <div style={{
            background: "linear-gradient(135deg, #1e2d7d 0%, #3b5bdb 100%)",
            borderRadius: 16, padding: "40px 30px", color: "#fff",
            aspectRatio: "16/10", display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 12, opacity: 0.8, letterSpacing: 2, textTransform: "uppercase" }}>Vale-Presente</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: "8px 0 0" }}>Imports China Brasil</h2>
            </div>
            <div>
              <p style={{ fontSize: 32, fontWeight: 800 }}>{formatMoney(selectedValue)}</p>
              {recipientName && <p style={{ fontSize: 14, opacity: 0.9 }}>Para: {recipientName}</p>}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAddToCart}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Valor</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {GIFT_CARD_VALUES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedValue(value)}
                  style={{
                    padding: "12px 8px", borderRadius: 8, border: "2px solid", cursor: "pointer",
                    fontWeight: 700, fontSize: 15,
                    borderColor: selectedValue === value ? "var(--primary-color, #1e2d7d)" : "#e1e3e5",
                    background: selectedValue === value ? "#eef2ff" : "#fff",
                    color: selectedValue === value ? "var(--primary-color, #1e2d7d)" : "#333",
                  }}
                >
                  {formatMoney(value)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Nome do destinatário</label>
            <input
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="João Silva"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #e1e3e5", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>E-mail do destinatário</label>
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="joao@email.com"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #e1e3e5", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Mensagem (opcional)</label>
            <textarea
              value={senderMessage}
              onChange={(e) => setSenderMessage(e.target.value)}
              placeholder="Feliz aniversário! 🎉"
              rows={3}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid #e1e3e5", borderRadius: 8, fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          {added && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#16a34a", textAlign: "center" }}>
              Vale-presente adicionado ao carrinho!
            </div>
          )}

          <button
            type="submit"
            className="button button--primary"
            style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 700 }}
          >
            Adicionar ao carrinho — {formatMoney(selectedValue)}
          </button>
        </form>
      </div>
    </div>
  );
}
