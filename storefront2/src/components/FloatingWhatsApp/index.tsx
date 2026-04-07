"use client";

import { useState } from "react";

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  message?: string;
  agentName?: string;
  position?: "left" | "right";
}

export default function FloatingWhatsApp({
  phoneNumber = "5511999999999",
  message = "Olá! Gostaria de saber mais sobre um produto.",
  agentName = "Atendimento UA",
  position = "right",
}: FloatingWhatsAppProps) {
  const [open, setOpen] = useState(false);
  const [userMessage, setUserMessage] = useState(message);

  const handleSend = () => {
    const encoded = encodeURIComponent(userMessage);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, "_blank");
    setOpen(false);
  };

  return (
    <div style={{
      position: "fixed",
      bottom: 80,
      [position]: 20,
      zIndex: 900,
    }}>
      {/* Chat popup */}
      {open && (
        <div style={{
          width: 320,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
          overflow: "hidden",
          marginBottom: 12,
          animation: "fadeInUp 0.2s ease-out",
        }}>
          {/* Header */}
          <div style={{
            background: "#25d366",
            padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 10, color: "#fff",
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>
              💬
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{agentName}</div>
              <div style={{ fontSize: 11, opacity: 0.9 }}>Online agora</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>

          {/* Chat body */}
          <div style={{ padding: 16, background: "#e5ddd5" }}>
            <div style={{
              background: "#fff", padding: "10px 14px", borderRadius: "0 12px 12px 12px",
              fontSize: 13, maxWidth: "80%", boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}>
              <p style={{ margin: 0 }}>Olá! 👋</p>
              <p style={{ margin: "4px 0 0" }}>Como posso ajudar?</p>
              <span style={{ fontSize: 10, color: "#999", float: "right" }}>agora</span>
            </div>
          </div>

          {/* Input */}
          <div style={{ padding: "8px 12px", display: "flex", gap: 8, borderTop: "1px solid #e5e7eb" }}>
            <input
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              style={{
                flex: 1, padding: "10px 12px",
                border: "1px solid #e5e7eb", borderRadius: 20,
                fontSize: 13, outline: "none",
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#25d366", border: "none",
                color: "#fff", cursor: "pointer", fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "#25d366", border: "none",
          color: "#fff", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(37,211,102,0.4)",
          fontSize: 28,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s",
          transform: open ? "rotate(90deg)" : "rotate(0)",
        }}
      >
        {open ? "✕" : "💬"}
      </button>

      <style dangerouslySetInnerHTML={{ __html: "@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }" }} />
    </div>
  );
}
