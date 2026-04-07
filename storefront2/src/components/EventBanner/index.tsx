"use client";

import { useState, useEffect } from "react";

interface EventBannerProps {
  eventName?: string;
  endDate?: string; // ISO date
  bgColor?: string;
  textColor?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function EventBanner({
  eventName = "Black Friday",
  endDate,
  bgColor = "#000000",
  textColor = "#ffffff",
  ctaText = "Ver ofertas",
  ctaLink = "/collections/all",
}: EventBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [active, setActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("event_banner_dismissed")) {
      setDismissed(true);
      return;
    }

    if (!endDate) return;
    const end = new Date(endDate).getTime();

    const update = () => {
      const diff = end - Date.now();
      if (diff <= 0) { setActive(false); return; }
      setActive(true);
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!active || dismissed) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("event_banner_dismissed", "1");
  };

  return (
    <div style={{
      background: bgColor,
      color: textColor,
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      flexWrap: "wrap",
      position: "relative",
    }}>
      <button onClick={dismiss} style={{
        position: "absolute", top: 8, right: 12,
        background: "none", border: "none", cursor: "pointer",
        color: textColor, opacity: 0.5, fontSize: 16,
      }}>✕</button>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 28 }}>🔥</span>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2 }}>
            {eventName}
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Ofertas exclusivas por tempo limitado</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {[
          { value: timeLeft.days, label: "dias" },
          { value: timeLeft.hours, label: "hrs" },
          { value: timeLeft.minutes, label: "min" },
          { value: timeLeft.seconds, label: "seg" },
        ].map((unit) => (
          <div key={unit.label} style={{ textAlign: "center" }}>
            <div style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 8, padding: "8px 12px",
              fontFamily: "monospace", fontSize: 24, fontWeight: 900,
              minWidth: 48, lineHeight: 1,
            }}>
              {pad(unit.value)}
            </div>
            <div style={{ fontSize: 9, opacity: 0.7, marginTop: 3, textTransform: "uppercase" }}>
              {unit.label}
            </div>
          </div>
        ))}
      </div>

      <a
        href={ctaLink}
        style={{
          background: textColor, color: bgColor,
          padding: "10px 24px", borderRadius: 8,
          fontWeight: 700, fontSize: 14,
          textDecoration: "none",
        }}
      >
        {ctaText} →
      </a>
    </div>
  );
}
