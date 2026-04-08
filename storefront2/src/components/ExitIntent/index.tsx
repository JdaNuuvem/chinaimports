"use client";
import { useState, useEffect } from "react";
import { getThemeConfig } from "@/lib/theme-config";

const STORAGE_KEY = "ua_exit_popup_shown";

export default function ExitIntent() {
  const cfg = getThemeConfig().popups?.exitIntent;
  const enabled = cfg?.enabled !== false;
  const headline = cfg?.headline || "Espera! Não vai embora!";
  const subheadline = cfg?.subheadline || "Temos um presente exclusivo para você";
  const couponCode = cfg?.couponCode || "VOLTA10";
  const activationDelayMs = (cfg?.activationDelaySeconds ?? 10) * 1000;

  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const handler = (e: MouseEvent) => {
      if (e.clientY <= 5 && e.movementY < -10) {
        setShow(true);
        sessionStorage.setItem(STORAGE_KEY, "true");
        document.removeEventListener("mousemove", handler);
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener("mousemove", handler);
    }, activationDelayMs);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousemove", handler);
    };
  }, [enabled, activationDelayMs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Track as a lead-style intent (cupom claimed)
    import("@/lib/sentinel").then(({ trackEvent }) => trackEvent("coupon_claimed", { code: couponCode, source: "exit_intent" })).catch(() => {});
  };

  if (!enabled || !show) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setShow(false)} />
      <div style={{
        position: "relative", background: "#fff", borderRadius: 16,
        maxWidth: 440, width: "90%", overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        animation: "slideInRight 0.3s ease",
      }}>
        {/* Close */}
        <button onClick={() => setShow(false)} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#888", zIndex: 1 }}>×</button>

        {/* Top banner */}
        <div style={{ background: "linear-gradient(135deg, #1e2d7d, #00badb)", padding: "30px 24px", textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎁</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{headline}</h2>
          <p style={{ fontSize: 14, opacity: 0.9, marginTop: 6 }}>{subheadline}</p>
        </div>

        {/* Content */}
        <div style={{ padding: "24px", textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "#333", marginBottom: 16 }}>
            Ganhe <strong style={{ color: "#e22120", fontSize: 20 }}>10% OFF</strong> na sua primeira compra
          </p>

          {/* Coupon code */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            <div style={{
              background: "#f6f6f7", border: "2px dashed #00badb",
              borderRadius: 8, padding: "12px 24px",
              fontFamily: "monospace", fontSize: 22, fontWeight: 800,
              color: "#1e2d7d", letterSpacing: 3,
            }}>
              {couponCode}
            </div>
            <button onClick={handleCopy} style={{
              padding: "12px 16px", background: "#008060", color: "#fff",
              border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13,
            }}>
              {copied ? "✓ Copiado!" : "Copiar"}
            </button>
          </div>

          <a href="/collections/all" style={{
            display: "inline-block", background: "#1e2d7d", color: "#fff",
            padding: "14px 40px", borderRadius: 8, textDecoration: "none",
            fontWeight: 700, fontSize: 15,
          }}>
            Usar cupom agora →
          </a>

          <p style={{ fontSize: 11, color: "#8c9196", marginTop: 12 }}>
            Válido por 24 horas · Primeira compra apenas
          </p>
        </div>
      </div>
    </div>
  );
}
