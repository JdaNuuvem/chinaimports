"use client";

import { useState, useEffect, useRef } from "react";

interface Prize {
  label: string;
  code: string;
  color: string;
  probability: number; // 0-1
}

const DEFAULT_PRIZES: Prize[] = [
  { label: "5% OFF", code: "GIRA5", color: "#3b82f6", probability: 0.3 },
  { label: "10% OFF", code: "GIRA10", color: "#8b5cf6", probability: 0.25 },
  { label: "15% OFF", code: "GIRA15", color: "#A53954", probability: 0.15 },
  { label: "Frete Grátis", code: "FRETEGIRA", color: "#16a34a", probability: 0.15 },
  { label: "Tente novamente", code: "", color: "#6b7280", probability: 0.1 },
  { label: "20% OFF", code: "GIRA20", color: "#f59e0b", probability: 0.05 },
];

export default function SpinWheel() {
  const [show, setShow] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const played = localStorage.getItem("spin_wheel_played");
    if (played) return;

    // Show after 45 seconds
    const timer = setTimeout(() => setShow(true), 45000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("spin_wheel_played", "1");
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSubmitted(true);
    // Subscribe
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    fetch(`${backendUrl}/store/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    // Pick winner based on probability
    const rand = Math.random();
    let cumulative = 0;
    let winner = DEFAULT_PRIZES[0];
    for (const prize of DEFAULT_PRIZES) {
      cumulative += prize.probability;
      if (rand <= cumulative) { winner = prize; break; }
    }

    const winnerIndex = DEFAULT_PRIZES.indexOf(winner);
    const segmentAngle = 360 / DEFAULT_PRIZES.length;
    const targetAngle = 360 - (winnerIndex * segmentAngle + segmentAngle / 2);
    const totalRotation = 360 * 5 + targetAngle; // 5 full rotations + target

    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(winner);
      localStorage.setItem("spin_wheel_played", "1");
    }, 4000);
  };

  if (!show) return null;

  const segmentAngle = 360 / DEFAULT_PRIZES.length;

  return (
    <>
      <div onClick={dismiss} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9998 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        zIndex: 9999, width: 440, maxWidth: "95vw",
        background: "#fff", borderRadius: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        overflow: "hidden",
      }}>
        <button onClick={dismiss} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9ca3af", zIndex: 5 }}>✕</button>

        <div style={{ background: "linear-gradient(135deg, #1e2d7d 0%, #7c3aed 100%)", padding: "20px 24px", textAlign: "center", color: "#fff" }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>🎰 Gire e Ganhe!</h2>
          <p style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>Tente a sorte e ganhe um desconto especial</p>
        </div>

        <div style={{ padding: "24px", textAlign: "center" }}>
          {!emailSubmitted ? (
            <form onSubmit={handleEmailSubmit}>
              <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>Cadastre seu e-mail para girar:</p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #e1e3e5", borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
              />
              <button type="submit" style={{ width: "100%", padding: "14px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Quero girar!
              </button>
            </form>
          ) : !result ? (
            <>
              {/* Simplified wheel visualization */}
              <div style={{ position: "relative", width: 240, height: 240, margin: "0 auto 20px" }}>
                <div style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  background: `conic-gradient(${DEFAULT_PRIZES.map((p, i) => `${p.color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(", ")})`,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                  border: "4px solid #1e2d7d",
                }} />
                {/* Pointer */}
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "12px solid transparent",
                  borderRight: "12px solid transparent",
                  borderTop: "20px solid #1e2d7d",
                  zIndex: 2,
                }} />
                {/* Center */}
                <div style={{
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  width: 50, height: 50, borderRadius: "50%",
                  background: "#fff", border: "3px solid #1e2d7d",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 900, color: "#1e2d7d",
                }}>
                  🎰
                </div>
              </div>

              <button
                onClick={spin}
                disabled={spinning}
                style={{
                  padding: "14px 40px", borderRadius: 10,
                  background: spinning ? "#9ca3af" : "#7c3aed",
                  color: "#fff", border: "none",
                  fontWeight: 800, fontSize: 16,
                  cursor: spinning ? "not-allowed" : "pointer",
                  width: "100%",
                }}
              >
                {spinning ? "Girando..." : "GIRAR AGORA!"}
              </button>
            </>
          ) : (
            /* Result */
            <div>
              <div style={{ fontSize: 48, marginBottom: 8 }}>
                {result.code ? "🎉" : "😅"}
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 900, color: result.code ? "#16a34a" : "#6b7280", margin: "0 0 8px" }}>
                {result.label}
              </h3>
              {result.code ? (
                <>
                  <div style={{
                    background: "#f0fdf4", border: "2px dashed #16a34a",
                    borderRadius: 10, padding: "14px",
                    margin: "16px 0",
                  }}>
                    <p style={{ fontSize: 28, fontWeight: 900, color: "#16a34a", letterSpacing: 3, margin: 0 }}>
                      {result.code}
                    </p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(result.code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    style={{
                      padding: "12px 24px", borderRadius: 8,
                      background: copied ? "#16a34a" : "#7c3aed",
                      color: "#fff", border: "none",
                      fontWeight: 700, fontSize: 14,
                      cursor: "pointer", width: "100%",
                    }}
                  >
                    {copied ? "✓ Código copiado!" : "Copiar código"}
                  </button>
                </>
              ) : (
                <p style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>
                  Não foi dessa vez! Continue comprando e tente novamente.
                </p>
              )}
              <button onClick={dismiss} style={{ marginTop: 12, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 13 }}>
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
