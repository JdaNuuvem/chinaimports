"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/utils";

interface PixPaymentProps {
  amount: number; // centavos
  qrCodeUrl?: string;
  pixKey?: string;
  expiresInMinutes?: number;
}

export default function PixPayment({ amount, qrCodeUrl, pixKey, expiresInMinutes = 30 }: PixPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(expiresInMinutes * 60);

  // Timer
  useState(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  });

  const copyPixKey = () => {
    if (pixKey) {
      navigator.clipboard.writeText(pixKey).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #e5e7eb", padding: 24,
      textAlign: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>🏦</span>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Pagamento via PIX</h3>
      </div>

      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
        Valor: <strong style={{ color: "#16a34a", fontSize: 20 }}>{formatMoney(amount)}</strong>
      </p>

      {/* QR Code placeholder */}
      <div style={{
        width: 200, height: 200, margin: "0 auto 16px",
        background: "#f9fafb", border: "2px dashed #d1d5db",
        borderRadius: 12, display: "flex", alignItems: "center",
        justifyContent: "center",
      }}>
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code PIX" style={{ width: "100%", height: "100%" }} />
        ) : (
          <div style={{ textAlign: "center", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 4 }}>📱</div>
            <div style={{ fontSize: 11 }}>QR Code PIX</div>
          </div>
        )}
      </div>

      {/* Copy-paste key */}
      {pixKey && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Ou copie o código PIX:</p>
          <div style={{ display: "flex", gap: 8, maxWidth: 400, margin: "0 auto" }}>
            <input
              readOnly
              value={pixKey}
              style={{
                flex: 1, padding: "10px 12px",
                border: "1px solid #d1d5db", borderRadius: 6,
                fontSize: 12, fontFamily: "monospace",
                background: "#f9fafb",
              }}
            />
            <button
              onClick={copyPixKey}
              style={{
                padding: "10px 16px", borderRadius: 6,
                background: copied ? "#16a34a" : "#1e2d7d",
                color: "#fff", border: "none",
                fontWeight: 600, fontSize: 13,
                cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {copied ? "✓ Copiado!" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      {/* Timer */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 14px", borderRadius: 20,
        background: timeLeft < 300 ? "#fef2f2" : "#fffbeb",
        color: timeLeft < 300 ? "#dc2626" : "#92400e",
        fontSize: 13, fontWeight: 600,
      }}>
        ⏰ Expira em {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>

      <div style={{ marginTop: 16, padding: "12px", background: "#f0fdf4", borderRadius: 8 }}>
        <p style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, margin: 0 }}>
          ✅ Pagamento confirmado instantaneamente
        </p>
        <p style={{ fontSize: 11, color: "#6b7280", margin: "4px 0 0" }}>
          Após a leitura do QR Code, seu pedido será processado automaticamente.
        </p>
      </div>
    </div>
  );
}
