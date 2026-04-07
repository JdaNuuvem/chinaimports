"use client";

import { useState, useEffect } from "react";
import { formatMoney } from "@/lib/utils";

interface CountdownDealProps {
  originalPrice: number;
  dealPrice: number;
  endsAt: string; // ISO date
  productTitle?: string;
  unitsLeft?: number;
}

export default function CountdownDeal({ originalPrice, dealPrice, endsAt, productTitle, unitsLeft }: CountdownDealProps) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const end = new Date(endsAt).getTime();
    const update = () => {
      const diff = end - Date.now();
      if (diff <= 0) { setActive(false); return; }
      setActive(true);
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (!active) return null;

  const savings = originalPrice - dealPrice;
  const savingsPercent = Math.round((savings / originalPrice) * 100);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{
      border: "2px solid #dc2626",
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 16,
    }}>
      <div style={{
        background: "#dc2626", color: "#fff",
        padding: "8px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontWeight: 800, fontSize: 14 }}>⚡ OFERTA RELÂMPAGO</span>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { v: timeLeft.h, l: "h" },
            { v: timeLeft.m, l: "m" },
            { v: timeLeft.s, l: "s" },
          ].map((u) => (
            <span key={u.l} style={{
              background: "rgba(0,0,0,0.3)",
              padding: "3px 6px", borderRadius: 4,
              fontFamily: "monospace", fontSize: 14, fontWeight: 800,
            }}>
              {pad(u.v)}{u.l}
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          {productTitle && <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{productTitle}</div>}
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#dc2626" }}>{formatMoney(dealPrice)}</span>
            <span style={{ fontSize: 14, textDecoration: "line-through", color: "#9ca3af" }}>{formatMoney(originalPrice)}</span>
          </div>
          <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
            Economia de {formatMoney(savings)} ({savingsPercent}% OFF)
          </span>
        </div>

        {unitsLeft !== undefined && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#dc2626" }}>{unitsLeft}</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>restantes</div>
          </div>
        )}
      </div>
    </div>
  );
}
