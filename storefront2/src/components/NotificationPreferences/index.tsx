"use client";

import { useState, useEffect } from "react";

interface Preferences {
  email_orders: boolean;
  email_marketing: boolean;
  email_price_drops: boolean;
  whatsapp_orders: boolean;
  whatsapp_marketing: boolean;
  push_orders: boolean;
  push_marketing: boolean;
}

const DEFAULT_PREFS: Preferences = {
  email_orders: true,
  email_marketing: true,
  email_price_drops: true,
  whatsapp_orders: false,
  whatsapp_marketing: false,
  push_orders: false,
  push_marketing: false,
};

const STORAGE_KEY = "notification_preferences";

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) }); } catch { /* ignore */ }
    }
  }, []);

  const toggle = (key: keyof Preferences) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Section = ({ title, icon, items }: { title: string; icon: string; items: { key: keyof Preferences; label: string }[] }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{title}</h4>
      </div>
      {items.map((item) => (
        <label
          key={item.key}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px", borderRadius: 8,
            border: "1px solid #e5e7eb", marginBottom: 6,
            cursor: "pointer", background: "#fff",
          }}
        >
          <span style={{ fontSize: 13 }}>{item.label}</span>
          <div
            onClick={() => toggle(item.key)}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: prefs[item.key] ? "#16a34a" : "#d1d5db",
              position: "relative", cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              background: "#fff", position: "absolute",
              top: 2, left: prefs[item.key] ? 22 : 2,
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }} />
          </div>
        </label>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Preferências de Notificação</h3>
        {saved && <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ Salvo</span>}
      </div>

      <Section
        title="E-mail"
        icon="📧"
        items={[
          { key: "email_orders", label: "Atualizações de pedidos" },
          { key: "email_marketing", label: "Promoções e novidades" },
          { key: "email_price_drops", label: "Alertas de queda de preço" },
        ]}
      />

      <Section
        title="WhatsApp"
        icon="📱"
        items={[
          { key: "whatsapp_orders", label: "Atualizações de pedidos" },
          { key: "whatsapp_marketing", label: "Ofertas exclusivas" },
        ]}
      />

      <Section
        title="Notificações Push"
        icon="🔔"
        items={[
          { key: "push_orders", label: "Status de pedidos" },
          { key: "push_marketing", label: "Promoções relâmpago" },
        ]}
      />
    </div>
  );
}
