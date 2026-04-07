"use client";
import { useState, useEffect } from "react";

export default function StoreStatus({ backendUrl }: { backendUrl: string }) {
  const [status, setStatus] = useState<{ ok: boolean; products: number; orders: number; uptime: number } | null>(null);

  useEffect(() => {
    const check = () => {
      fetch(`${backendUrl}/health`).then((r) => r.json()).then((d) => setStatus({ ok: d.status === "ok", products: d.products, orders: d.orders, uptime: d.uptime })).catch(() => setStatus({ ok: false, products: 0, orders: 0, uptime: 0 }));
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  if (!status) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6d7175" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.ok ? "#27c93f" : "#ff5f56", boxShadow: status.ok ? "0 0 6px #27c93f" : "0 0 6px #ff5f56" }} />
      <span>{status.ok ? "Online" : "Offline"}</span>
      {status.ok && <span style={{ color: "#8c9196" }}>· {status.products} produtos · {Math.floor(status.uptime / 60)}min</span>}
    </div>
  );
}
