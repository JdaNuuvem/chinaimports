"use client";

import { useState, useEffect } from "react";

interface FlashSaleProps {
  endTime?: string; // ISO date string
  title?: string;
  discount?: string;
}

export default function FlashSale({ endTime, title = "Oferta Relâmpago", discount = "30% OFF" }: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Default: ends at midnight today or 6 hours from now if no endTime
    const end = endTime
      ? new Date(endTime).getTime()
      : (() => {
          const d = new Date();
          d.setHours(23, 59, 59, 0);
          return d.getTime();
        })();

    const update = () => {
      const diff = end - Date.now();
      if (diff <= 0) {
        setActive(false);
        return;
      }
      setActive(true);
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!active) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{
      background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
      color: "#fff",
      padding: "12px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>⚡</span>
        <span style={{ fontWeight: 800, fontSize: 15, textTransform: "uppercase", letterSpacing: 1 }}>{title}</span>
        <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 4, fontWeight: 800, fontSize: 14 }}>{discount}</span>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {[
          { value: timeLeft.hours, label: "hrs" },
          { value: timeLeft.minutes, label: "min" },
          { value: timeLeft.seconds, label: "seg" },
        ].map((unit) => (
          <div key={unit.label} style={{ textAlign: "center" }}>
            <div style={{
              background: "rgba(0,0,0,0.3)",
              borderRadius: 6,
              padding: "6px 10px",
              fontFamily: "monospace",
              fontSize: 20,
              fontWeight: 800,
              minWidth: 44,
              lineHeight: 1,
            }}>
              {pad(unit.value)}
            </div>
            <div style={{ fontSize: 9, opacity: 0.8, marginTop: 2, textTransform: "uppercase" }}>{unit.label}</div>
          </div>
        ))}
      </div>

      <a
        href="/collections/all"
        style={{
          background: "#fff",
          color: "#dc2626",
          padding: "8px 20px",
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 13,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        Ver ofertas →
      </a>
    </div>
  );
}
