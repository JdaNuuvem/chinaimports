"use client";
import { useState, useCallback } from "react";

const COOKIE_KEY = "ua_cookie_consent";

function getInitialShow() {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(COOKIE_KEY);
}

export default function CookieConsent() {
  const [show, setShow] = useState(getInitialShow);

  const accept = useCallback(() => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setShow(false);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "var(--heading-color, #1c1b1b)", color: "#fff",
      padding: "16px 20px", zIndex: 10000,
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 20, flexWrap: "wrap", fontSize: 14,
      boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
    }}>
      <p style={{ margin: 0, maxWidth: 600 }}>
        Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{" "}
        <a href="/pages/privacidade" style={{ color: "var(--accent-color, #00badb)", textDecoration: "underline" }}>
          Política de Privacidade
        </a>.
      </p>
      <button onClick={accept} style={{ padding: "10px 28px", background: "var(--accent-color, #00badb)", color: "#fff", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
        Aceitar
      </button>
    </div>
  );
}
