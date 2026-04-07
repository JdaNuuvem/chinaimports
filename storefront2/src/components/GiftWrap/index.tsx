"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/utils";

interface GiftWrapProps {
  price?: number; // centavos
  onToggle?: (enabled: boolean, message: string) => void;
}

export default function GiftWrap({ price = 990, onToggle }: GiftWrapProps) {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    onToggle?.(next, message);
  };

  return (
    <div style={{
      border: `1px solid ${enabled ? "#16a34a" : "#e5e7eb"}`,
      borderRadius: 8, padding: "12px 14px",
      background: enabled ? "#f0fdf4" : "#fff",
      marginTop: 12, transition: "all 0.2s",
    }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <input type="checkbox" checked={enabled} onChange={toggle} style={{ width: 18, height: 18 }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>🎁 Embalagem para presente</span>
          <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>+{formatMoney(price)}</span>
        </div>
      </label>

      {enabled && (
        <div style={{ marginTop: 10 }}>
          <textarea
            value={message}
            onChange={(e) => { setMessage(e.target.value); onToggle?.(true, e.target.value); }}
            placeholder="Mensagem personalizada (opcional)"
            rows={2}
            maxLength={150}
            style={{
              width: "100%", padding: "8px 10px",
              border: "1px solid #bbf7d0", borderRadius: 6,
              fontSize: 13, resize: "none", background: "#fff",
              boxSizing: "border-box",
            }}
          />
          <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, textAlign: "right" }}>
            {message.length}/150
          </p>
        </div>
      )}
    </div>
  );
}
