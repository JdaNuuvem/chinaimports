"use client";

import { useState, useEffect } from "react";

export default function ShippingDeadline() {
  const [timeLeft, setTimeLeft] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hour = now.getHours();

      // Show deadline only during business hours (before cutoff at 16:00)
      if (hour >= 8 && hour < 16) {
        const cutoff = new Date();
        cutoff.setHours(16, 0, 0, 0);
        const diff = cutoff.getTime() - now.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setTimeLeft(`${hours}h ${minutes}min`);
        setShow(true);
      } else {
        // After cutoff — show next day message
        setTimeLeft("");
        setShow(false);
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: "#f0fdf4", border: "1px solid #bbf7d0",
      borderRadius: 8, padding: "8px 12px", marginBottom: 12,
      fontSize: 13,
    }}>
      <span style={{ fontSize: 16 }}>🚚</span>
      <div>
        <span style={{ color: "#16a34a", fontWeight: 700 }}>Compre nas próximas {timeLeft}</span>
        <span style={{ color: "#6b7280" }}> e receba até {getEstimatedDate()}</span>
      </div>
    </div>
  );
}

function getEstimatedDate(): string {
  const date = new Date();
  // Add 3-5 business days
  let days = 3;
  while (days > 0) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) days--;
  }
  return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}
