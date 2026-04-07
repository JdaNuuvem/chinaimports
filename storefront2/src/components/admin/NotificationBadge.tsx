"use client";
import { useState, useEffect } from "react";

export default function NotificationBadge({ backendUrl, token, onClick }: { backendUrl: string; token?: string; onClick: () => void }) {
  const [newOrders, setNewOrders] = useState(0);
  const [lastCheck, setLastCheck] = useState(() => Date.now());

  useEffect(() => {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const check = () => {
      fetch(`${backendUrl}/admin/stats`, { headers }).then((r) => r.json()).then((d) => {
        const recentOrders = (d.recentOrders || []).filter((o: { createdAt: string }) => new Date(o.createdAt).getTime() > lastCheck);
        if (recentOrders.length > 0) setNewOrders((prev) => prev + recentOrders.length);
      }).catch(() => {});
    };
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, [backendUrl, lastCheck]);

  const handleClick = () => {
    setNewOrders(0);
    setLastCheck(Date.now());
    onClick();
  };

  if (newOrders === 0) return null;

  return (
    <button onClick={handleClick} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
      <span style={{ fontSize: 16 }}>🔔</span>
      <span style={{
        position: "absolute", top: -2, right: -4,
        background: "#d72c0d", color: "#fff",
        fontSize: 9, fontWeight: 700,
        width: 16, height: 16, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {newOrders}
      </span>
    </button>
  );
}
