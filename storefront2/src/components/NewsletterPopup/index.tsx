"use client";

import { useState, useEffect } from "react";

export default function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("newsletter_popup_dismissed");
    if (dismissed) return;

    // Show after 60 seconds or on scroll > 50%
    const timer = setTimeout(() => setShow(true), 60000);

    const onScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.5) {
        setShow(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("newsletter_popup_dismissed", "1");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    fetch(`${backendUrl}/store/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    // Sentinel lead event
    import("@/lib/sentinel").then(({ trackLead }) => trackLead(email, "newsletter_popup")).catch(() => {});
    setSubmitted(true);
    localStorage.setItem("newsletter_popup_dismissed", "1");
    setTimeout(() => setShow(false), 3000);
  };

  if (!show) return null;

  return (
    <>
      <div onClick={dismiss} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998 }} />
      <div style={{
        position: "fixed", bottom: 20, left: 20,
        width: 360, maxWidth: "calc(100vw - 40px)",
        background: "#fff", borderRadius: 16,
        boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        zIndex: 9999, overflow: "hidden",
        animation: "slideInLeft 0.3s ease-out",
      }}>
        <button onClick={dismiss} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af", zIndex: 1 }}>✕</button>

        <div style={{ padding: "24px" }}>
          {!submitted ? (
            <>
              <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>📬</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, textAlign: "center", margin: "0 0 8px" }}>
                Fique por dentro!
              </h3>
              <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", marginBottom: 16 }}>
                Receba ofertas exclusivas e lançamentos em primeira mão.
              </p>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu melhor e-mail"
                  style={{ width: "100%", padding: "12px 14px", border: "1px solid #e1e3e5", borderRadius: 8, fontSize: 14, marginBottom: 10, boxSizing: "border-box" }}
                />
                <button type="submit" style={{ width: "100%", padding: "12px", background: "var(--primary-color, #1e2d7d)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Quero receber!
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <p style={{ fontWeight: 700, color: "#16a34a" }}>Cadastro realizado!</p>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: "@keyframes slideInLeft { from { transform: translateX(-120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }" }} />
    </>
  );
}
