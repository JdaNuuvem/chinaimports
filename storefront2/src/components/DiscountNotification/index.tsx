"use client";

import { useState, useEffect } from "react";

interface Props {
  couponCode?: string;
  discount?: string;
  expiresInMinutes?: number;
}

export default function DiscountNotification({ couponCode = "PROMO15", discount = "15% OFF", expiresInMinutes = 30 }: Props) {
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState(expiresInMinutes * 60);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("discount_notification_dismissed");
    if (dismissed) return;

    // Show after 20 seconds
    const showTimer = setTimeout(() => setShow(true), 20000);

    // Get or set start time
    const key = "discount_notification_start";
    const stored = sessionStorage.getItem(key);
    const startTime = stored ? Number(stored) : Date.now();
    if (!stored) sessionStorage.setItem(key, String(startTime));

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, expiresInMinutes * 60 - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setShow(false);
        clearInterval(interval);
      }
    }, 1000);

    return () => { clearTimeout(showTimer); clearInterval(interval); };
  }, [expiresInMinutes]);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("discount_notification_dismissed", "1");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!show) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div style={{
      position: "fixed", top: 80, right: 20,
      width: 300, background: "#fff",
      borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
      border: "1px solid #e5e7eb",
      zIndex: 950,
      animation: "slideInRight 0.3s ease-out",
      overflow: "hidden",
    }}>
      <div style={{ background: "linear-gradient(135deg, #1e2d7d 0%, #3b5bdb 100%)", padding: "12px 16px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>🎁 {discount}</span>
        <button onClick={dismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 16 }}>✕</button>
      </div>

      <div style={{ padding: "16px" }}>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
          Use o código abaixo no checkout:
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{
            flex: 1, background: "#f9fafb", border: "2px dashed #1e2d7d",
            borderRadius: 6, padding: "10px", textAlign: "center",
            fontWeight: 800, fontSize: 16, letterSpacing: 2,
            color: "#1e2d7d",
          }}>
            {couponCode}
          </div>
          <button onClick={copyCode} style={{
            padding: "10px 14px", borderRadius: 6, border: "1px solid #1e2d7d",
            background: copied ? "#1e2d7d" : "#fff",
            color: copied ? "#fff" : "#1e2d7d",
            cursor: "pointer", fontSize: 12, fontWeight: 600,
          }}>
            {copied ? "✓" : "Copiar"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#dc2626", fontSize: 12, fontWeight: 600 }}>
          <span>⏰</span>
          <span>
            Expira em {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: "@keyframes slideInRight { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }" }} />
    </div>
  );
}
