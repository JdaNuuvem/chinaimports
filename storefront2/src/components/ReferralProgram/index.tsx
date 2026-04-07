"use client";

import { useState, useEffect } from "react";

export default function ReferralProgram() {
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    // Generate or retrieve referral code
    let code = localStorage.getItem("referral_code");
    if (!code) {
      code = `ICB${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      localStorage.setItem("referral_code", code);
    }
    setReferralCode(code);

    // Get referral count
    const count = Number(localStorage.getItem("referral_count") || "0");
    setReferralCount(count);
  }, []);

  const referralUrl = typeof window !== "undefined"
    ? `${window.location.origin}?ref=${referralCode}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Compre na Imports China Brasil com o meu link e ganhe 10% de desconto na primeira compra! 🏋️‍♂️\n\n${referralUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #1e2d7d 0%, #3b5bdb 100%)",
      borderRadius: 16, padding: 24, color: "#fff",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 32 }}>🎁</span>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Indique e Ganhe</h3>
          <p style={{ fontSize: 13, opacity: 0.85, margin: "4px 0 0" }}>
            Ganhe R$ 20 por cada amigo que comprar!
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{
          flex: 1, background: "rgba(255,255,255,0.15)",
          borderRadius: 8, padding: "10px 14px",
          fontSize: 14, fontFamily: "monospace", fontWeight: 700,
          display: "flex", alignItems: "center",
          overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {referralCode}
        </div>
        <button
          onClick={copyLink}
          style={{
            padding: "10px 16px", borderRadius: 8,
            background: copied ? "#16a34a" : "rgba(255,255,255,0.2)",
            color: "#fff", border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: 13, whiteSpace: "nowrap",
          }}
        >
          {copied ? "✓ Copiado!" : "Copiar link"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={shareWhatsApp}
          style={{
            flex: 1, padding: "10px",
            background: "#25d366", color: "#fff",
            border: "none", borderRadius: 8,
            fontWeight: 600, fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          📱 Compartilhar no WhatsApp
        </button>
      </div>

      {referralCount > 0 && (
        <div style={{ marginTop: 16, padding: "10px", background: "rgba(255,255,255,0.1)", borderRadius: 8, textAlign: "center" }}>
          <span style={{ fontWeight: 700 }}>{referralCount}</span> amigo{referralCount > 1 ? "s" : ""} indicado{referralCount > 1 ? "s" : ""}
          {" — "}
          <span style={{ fontWeight: 700, color: "#86efac" }}>R$ {(referralCount * 20).toFixed(2).replace(".", ",")}</span> em créditos
        </div>
      )}

      <p style={{ fontSize: 11, opacity: 0.6, marginTop: 12, textAlign: "center" }}>
        Seu amigo ganha 10% OFF na primeira compra. Você ganha R$ 20 em crédito.
      </p>
    </div>
  );
}
