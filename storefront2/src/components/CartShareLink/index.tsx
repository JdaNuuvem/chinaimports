"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/utils";

export default function CartShareLink() {
  const { cart } = useCart();
  const [copied, setCopied] = useState(false);

  if (!cart?.items?.length) return null;

  const buildWhatsAppMessage = () => {
    const items = cart.items
      .map((i) => `• ${i.title} × ${i.quantity} — ${formatMoney(i.total)}`)
      .join("\n");
    const total = formatMoney(cart.total);
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

    return encodeURIComponent(
      `Olha meu carrinho na Imports China Brasil! 🏋️‍♂️\n\n${items}\n\nTotal: ${total}\n\n${siteUrl}/cart`
    );
  };

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${buildWhatsAppMessage()}`, "_blank");
  };

  const copyLink = () => {
    const url = `${window.location.origin}/cart`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <button
        onClick={shareViaWhatsApp}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 6, border: "1px solid #25d366",
          background: "#fff", color: "#25d366", cursor: "pointer",
          fontSize: 12, fontWeight: 600,
        }}
      >
        <span style={{ fontSize: 16 }}>📱</span>
        Compartilhar via WhatsApp
      </button>
      <button
        onClick={copyLink}
        style={{
          padding: "8px 14px", borderRadius: 6, border: "1px solid #e1e3e5",
          background: "#fff", color: "#6b7280", cursor: "pointer",
          fontSize: 12, fontWeight: 600,
        }}
      >
        {copied ? "✓ Link copiado!" : "Copiar link"}
      </button>
    </div>
  );
}
