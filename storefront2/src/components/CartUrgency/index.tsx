"use client";

import { useState, useEffect } from "react";

interface CartUrgencyProps {
  reserveMinutes?: number;
}

export default function CartUrgency({ reserveMinutes = 15 }: CartUrgencyProps) {
  const [timeLeft, setTimeLeft] = useState(reserveMinutes * 60);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Get or set reservation start time
    const key = "cart_reserve_start";
    const stored = localStorage.getItem(key);
    const startTime = stored ? Number(stored) : Date.now();
    if (!stored) localStorage.setItem(key, String(startTime));

    const update = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, reserveMinutes * 60 - elapsed);
      setTimeLeft(remaining);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [reserveMinutes]);

  if (dismissed || timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const urgency = timeLeft < 300; // less than 5 min

  return (
    <div style={{
      background: urgency ? "#fef2f2" : "#fffbeb",
      border: `1px solid ${urgency ? "#fecaca" : "#fde68a"}`,
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{urgency ? "⚠️" : "⏰"}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: urgency ? "#dc2626" : "#d97706" }}>
            Seus itens estão reservados por{" "}
            <span style={{ fontFamily: "monospace", fontSize: 15 }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>
            {urgency ? "Finalize logo para não perder!" : "Complete sua compra para garantir"}
          </div>
        </div>
      </div>
      <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14 }}>✕</button>
    </div>
  );
}
