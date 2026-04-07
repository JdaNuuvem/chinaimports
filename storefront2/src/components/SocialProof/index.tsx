"use client";
import { useState, useEffect, useCallback } from "react";

const FIRST_NAMES = ["João", "Maria", "Pedro", "Ana", "Carlos", "Juliana", "Rafael", "Fernanda", "Lucas", "Camila", "Bruno", "Larissa", "Diego", "Patrícia", "Thiago", "Beatriz"];
const CITIES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre", "Salvador", "Fortaleza", "Recife", "Brasília", "Florianópolis", "Goiânia", "Manaus"];
const PRODUCTS = ["Camiseta UA Tech 2.0", "Bermuda UA Launch Run", "Tênis UA Charged Pursuit", "Legging UA HeatGear", "Regata UA Streaker", "Mochila UA Hustle 5.0"];

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function SocialProof() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({ name: "", city: "", product: "", minutes: 0 });

  const showNotification = useCallback(() => {
    setData({
      name: random(FIRST_NAMES),
      city: random(CITIES),
      product: random(PRODUCTS),
      minutes: Math.floor(Math.random() * 15) + 1,
    });
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  }, []);

  useEffect(() => {
    // First show after 8-15 seconds
    const firstTimeout = setTimeout(showNotification, 8000 + Math.random() * 7000);

    // Then every 20-40 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.3) showNotification(); // 70% chance each cycle
    }, 20000 + Math.random() * 20000);

    return () => { clearTimeout(firstTimeout); clearInterval(interval); };
  }, [showNotification]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        zIndex: 9998,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        maxWidth: 340,
        animation: "slideInLeft 0.4s ease",
        border: "1px solid #e1e3e5",
        cursor: "pointer",
      }}
      onClick={() => setVisible(false)}
    >
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent-color, #00badb)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        🛒
      </div>
      <div>
        <div style={{ fontSize: 13, color: "#202223", lineHeight: 1.4 }}>
          <strong>{data.name}</strong> de <strong>{data.city}</strong> comprou
        </div>
        <div style={{ fontSize: 12, color: "var(--accent-color, #00badb)", fontWeight: 600 }}>
          {data.product}
        </div>
        <div style={{ fontSize: 11, color: "#8c9196", marginTop: 2 }}>
          há {data.minutes} minuto{data.minutes > 1 ? "s" : ""}
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); setVisible(false); }} style={{ position: "absolute", top: 4, right: 8, background: "none", border: "none", cursor: "pointer", color: "#8c9196", fontSize: 14 }}>×</button>
    </div>
  );
}
