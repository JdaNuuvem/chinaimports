"use client";
import { useState, useEffect } from "react";

interface UrgencyTimerProps {
  endTime?: Date;
  label?: string;
}

export default function UrgencyTimer({ endTime, label = "Oferta termina em" }: UrgencyTimerProps) {
  // Default: random time between 1-4 hours from now (seeded by day so it's consistent per session)
  const [target] = useState(() => {
    if (endTime) return endTime.getTime();
    const seed = new Date().toDateString();
    const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return Date.now() + ((hash % 4) + 1) * 3600000 + (hash % 60) * 60000;
  });

  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 14px", borderRadius: 6,
      background: "linear-gradient(135deg, #ff6b35, #e22120)",
      color: "#fff", fontSize: 13, fontWeight: 600,
    }}>
      <span>⏰</span>
      <span>{label}</span>
      <div style={{ display: "flex", gap: 4 }}>
        <span style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 15 }}>{pad(timeLeft.h)}</span>
        <span>:</span>
        <span style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 15 }}>{pad(timeLeft.m)}</span>
        <span>:</span>
        <span style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 15 }}>{pad(timeLeft.s)}</span>
      </div>
    </div>
  );
}
