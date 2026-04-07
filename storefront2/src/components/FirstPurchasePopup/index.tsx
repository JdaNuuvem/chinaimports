"use client";

import { useState, useEffect } from "react";

export default function FirstPurchasePopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Only show if user hasn't seen it before and hasn't made a purchase
    const dismissed = localStorage.getItem("first_purchase_popup_dismissed");
    const hasPurchased = localStorage.getItem("has_purchased");
    if (dismissed || hasPurchased) return;

    // Show after 15 seconds on site
    const timer = setTimeout(() => setShow(true), 15000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("first_purchase_popup_dismissed", "1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Subscribe to newsletter
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    fetch(`${backendUrl}/store/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});

    setSubmitted(true);
    localStorage.setItem("first_purchase_popup_dismissed", "1");
    setTimeout(() => setShow(false), 5000);
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={dismiss} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998 }} />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        zIndex: 9999, width: 420, maxWidth: "90vw",
        background: "#fff", borderRadius: 16, overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        animation: "fadeInUp 0.3s ease-out",
      }}>
        <button onClick={dismiss} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9ca3af", zIndex: 1 }}>
          ✕
        </button>

        <div style={{ background: "linear-gradient(135deg, #1e2d7d 0%, #3b5bdb 100%)", padding: "32px 24px", textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>10% OFF</h2>
          <p style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>na sua primeira compra!</p>
        </div>

        <div style={{ padding: "24px" }}>
          {!submitted ? (
            <>
              <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 16 }}>
                Cadastre-se e ganhe um cupom exclusivo de desconto.
              </p>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail"
                  style={{ width: "100%", padding: "12px 14px", border: "1px solid #e1e3e5", borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
                />
                <button
                  type="submit"
                  style={{ width: "100%", padding: "14px", background: "#1e2d7d", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer" }}
                >
                  Quero meu desconto!
                </button>
              </form>
              <p style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 12 }}>
                Ao se cadastrar você aceita receber novidades por e-mail.
              </p>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#16a34a", margin: "0 0 8px" }}>Cupom ativado!</h3>
              <div style={{ background: "#f0fdf4", border: "2px dashed #16a34a", borderRadius: 8, padding: "12px", marginBottom: 12 }}>
                <p style={{ fontSize: 24, fontWeight: 800, color: "#16a34a", letterSpacing: 2, margin: 0 }}>BEMVINDO10</p>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Use este cupom no checkout para 10% de desconto!</p>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: "@keyframes fadeInUp { from { opacity: 0; transform: translate(-50%, -45%); } to { opacity: 1; transform: translate(-50%, -50%); } }" }} />
    </>
  );
}
