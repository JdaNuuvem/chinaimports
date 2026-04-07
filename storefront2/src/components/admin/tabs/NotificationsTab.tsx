"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader, KpiCard, StatusBadge, ActionButton, Section, type StatusVariant } from "./shared";

interface Notification {
  id: string;
  type: "order" | "stock" | "system" | "error" | "payment" | "review";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  severity: "info" | "warning" | "error" | "success";
  link?: string;
}

interface NotificationsTabProps {
  backendUrl: string;
  token?: string;
}

export default function NotificationsTab({ backendUrl, token }: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const load = useCallback(async () => {
    setLoading(true);
    const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      // Derive notifications from recent orders, stock alerts, abandoned carts
      const [ordersRes, statsRes] = await Promise.all([
        fetch(`${backendUrl}/admin/orders?limit=10`, { headers: authHeaders }),
        fetch(`${backendUrl}/admin/stats`, { headers: authHeaders }),
      ]);
      const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] };
      const stats = statsRes.ok ? await statsRes.json() : { abandonedCarts: 0 };

      const list: Notification[] = [];

      // New order notifications (last 24h)
      const dayAgo = Date.now() - 86400000;
      for (const o of ordersData.orders || []) {
        const created = new Date(o.createdAt).getTime();
        if (created > dayAgo) {
          list.push({
            id: `order-${o.id}`,
            type: "order",
            title: `Novo pedido #${o.displayId}`,
            message: `Pedido de R$ ${((o.total || 0) / 100).toFixed(2).replace(".", ",")} recebido`,
            createdAt: o.createdAt,
            read: false,
            severity: "info",
            link: `/admin/theme?tab=orders-list`,
          });
        }
      }

      // Abandoned cart alert
      if (stats.abandonedCarts > 0) {
        list.push({
          id: "abandoned-carts",
          type: "payment",
          title: `${stats.abandonedCarts} carrinho(s) abandonado(s)`,
          message: "Considere enviar e-mail de recuperação aos clientes",
          createdAt: new Date().toISOString(),
          read: false,
          severity: "warning",
        });
      }

      // System welcome
      list.push({
        id: "welcome",
        type: "system",
        title: "Bem-vindo ao painel!",
        message: "Configure suas integrações na aba Integrações para começar a vender",
        createdAt: new Date().toISOString(),
        read: false,
        severity: "info",
      });

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(list);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [backendUrl, token]);

  useEffect(() => { load(); }, [load]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const visible = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const severityVariant = (s: Notification["severity"]): StatusVariant => {
    if (s === "error") return "failed";
    if (s === "warning") return "warning";
    if (s === "success") return "success";
    return "info";
  };

  const typeIcon = (type: Notification["type"]): string => {
    const icons: Record<Notification["type"], string> = {
      order: "🛒",
      stock: "📦",
      system: "⚙️",
      error: "⚠️",
      payment: "💳",
      review: "⭐",
    };
    return icons[type];
  };

  const relativeTime = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div>
      <PageHeader
        title="Notificações"
        subtitle="Alertas e atualizações do sistema"
        actions={
          <>
            <ActionButton variant="secondary" onClick={load}>Atualizar</ActionButton>
            {unreadCount > 0 && <ActionButton variant="primary" onClick={markAllAsRead}>Marcar tudo como lido</ActionButton>}
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Total" value={notifications.length} />
        <KpiCard label="Não lidas" value={unreadCount} trendDirection={unreadCount > 0 ? "down" : "up"} />
        <KpiCard label="Pedidos" value={notifications.filter((n) => n.type === "order").length} />
        <KpiCard label="Alertas" value={notifications.filter((n) => n.severity === "warning" || n.severity === "error").length} />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "10px 18px",
              background: "none",
              border: "none",
              borderBottom: filter === f ? "2px solid #00badb" : "2px solid transparent",
              color: filter === f ? "#00badb" : "#6b7280",
              fontWeight: filter === f ? 700 : 500,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {f === "all" ? "Todas" : `Não lidas (${unreadCount})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Carregando...</div>
      ) : visible.length === 0 ? (
        <Section title="Sem notificações" description="Você está em dia 🎉">
          <p style={{ color: "#9ca3af", fontSize: 13 }}>Nenhuma notificação {filter === "unread" ? "não lida" : ""} no momento.</p>
        </Section>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map((n) => (
            <div
              key={n.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px 18px",
                background: n.read ? "#fff" : "#f0fdfa",
                border: `1px solid ${n.read ? "#e5e7eb" : "#a5f3fc"}`,
                borderRadius: 10,
                transition: "transform 0.15s, box-shadow 0.15s",
                cursor: "pointer",
              }}
              onClick={() => setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
            >
              <div style={{ fontSize: 24, flexShrink: 0 }}>{typeIcon(n.type)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#202223" }}>{n.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <StatusBadge label={n.type} variant={severityVariant(n.severity)} />
                    {!n.read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00badb" }} />}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{n.message}</p>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{relativeTime(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
