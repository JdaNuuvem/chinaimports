"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  endDate: string; // ISO date
  label?: string;
  size?: "sm" | "md" | "lg";
  onExpire?: () => void;
}

const SIZES = {
  sm: { box: 36, font: 14, label: 8, gap: 4 },
  md: { box: 48, font: 20, label: 9, gap: 6 },
  lg: { box: 64, font: 28, label: 10, gap: 8 },
};

export default function Countdown({ endDate, label, size = "md", onExpire }: CountdownProps) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const end = new Date(endDate).getTime();
    const update = () => {
      const diff = end - Date.now();
      if (diff <= 0) {
        setExpired(true);
        onExpire?.();
        return;
      }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  if (expired) return null;

  const s = SIZES[size];
  const pad = (n: number) => String(n).padStart(2, "0");

  const units = time.d > 0
    ? [{ v: time.d, l: "dias" }, { v: time.h, l: "hrs" }, { v: time.m, l: "min" }]
    : [{ v: time.h, l: "hrs" }, { v: time.m, l: "min" }, { v: time.s, l: "seg" }];

  return (
    <div style={{ textAlign: "center" }}>
      {label && <p style={{ fontSize: s.label + 2, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>{label}</p>}
      <div style={{ display: "inline-flex", gap: s.gap }}>
        {units.map((unit) => (
          <div key={unit.l} style={{ textAlign: "center" }}>
            <div style={{
              width: s.box, height: s.box,
              background: "#1e2d7d", color: "#fff",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "monospace",
              fontSize: s.font, fontWeight: 900,
            }}>
              {pad(unit.v)}
            </div>
            <div style={{ fontSize: s.label, color: "#9ca3af", marginTop: 3, textTransform: "uppercase" }}>
              {unit.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
