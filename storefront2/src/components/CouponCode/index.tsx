"use client";

import { useState } from "react";

interface CouponCodeProps {
  code: string;
  discount: string;
  description?: string;
  expiresAt?: string;
  variant?: "inline" | "card";
}

export default function CouponCode({ code, discount, description, expiresAt, variant = "inline" }: CouponCodeProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (variant === "card") {
    return (
      <div style={{
        border: "2px dashed var(--primary-color, #1e2d7d)",
        borderRadius: 10, padding: "16px 20px",
        background: "#fafbff",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary-color, #1e2d7d)" }}>{discount}</div>
          {description && <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>{description}</p>}
          {expiresAt && (
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
              Válido até {new Date(expiresAt).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
        <button
          onClick={copy}
          style={{
            padding: "10px 20px", borderRadius: 8,
            background: copied ? "#16a34a" : "var(--primary-color, #1e2d7d)",
            color: "#fff", border: "none",
            fontWeight: 700, fontSize: 14,
            cursor: "pointer", whiteSpace: "nowrap",
            fontFamily: "monospace", letterSpacing: 1,
          }}
        >
          {copied ? "✓ Copiado!" : code}
        </button>
      </div>
    );
  }

  // Inline variant
  return (
    <span
      onClick={copy}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 10px", borderRadius: 4,
        border: "1px dashed var(--primary-color, #1e2d7d)",
        background: "#fafbff",
        cursor: "pointer", fontSize: 13,
        fontFamily: "monospace", fontWeight: 700,
        color: "var(--primary-color, #1e2d7d)",
        transition: "background 0.2s",
      }}
      title="Clique para copiar"
    >
      {copied ? "✓ Copiado!" : code}
    </span>
  );
}
