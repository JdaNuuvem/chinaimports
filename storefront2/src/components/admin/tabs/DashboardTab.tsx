"use client";

import { useState, useEffect } from "react";
import { Section, PageHeader, KpiCard, StatusBadge, type StatusVariant } from "./shared";

interface DashboardStats {
  totalProducts: number; totalOrders: number; totalCustomers: number;
  totalRevenue: number; averageOrderValue: number; abandonedCarts: number;
  recentOrders: Array<{ id: string; displayId: number; total: number; status: string; createdAt: string; itemCount: number }>;
  topProducts: Array<{ title: string; soldCount: number; revenue: number }>;
  dailyStats: Record<string, { orders: number; revenue: number }>;
}

export default function DashboardTab({ backendUrl, token }: { backendUrl: string; token?: string }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Last 7 days computed in useEffect to keep render pure (React 19 strict mode)
  const [last7Days, setLast7Days] = useState<string[]>([]);

  useEffect(() => {
    Promise.resolve().then(() => {
      const days: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        days.push(d.toISOString().split("T")[0]);
      }
      setLast7Days(days);
    });
  }, []);

  useEffect(() => {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${backendUrl}/admin/stats`, { headers }).then((r) => { if (!r.ok) throw new Error("Failed"); return r.json(); }).then((d) => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, [backendUrl, token]);

  if (loading) return <p style={{ color: "#6d7175" }}>Carregando dashboard...</p>;
  if (!stats) return <p style={{ color: "#d72c0d" }}>Erro ao carregar dados. O backend está rodando?</p>;

  const formatBRL = (v: number) => `R$ ${(v / 100).toFixed(2).replace(".", ",")}`;
  const maxDayRevenue = Math.max(1, ...last7Days.map((d) => stats.dailyStats[d]?.revenue || 0));

  const conversionRate = stats.totalOrders > 0 && stats.abandonedCarts + stats.totalOrders > 0
    ? Math.round((stats.totalOrders / (stats.abandonedCarts + stats.totalOrders)) * 100)
    : 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da sua loja hoje"
      />

      {/* KPI Cards — primary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 16 }}>
        <KpiCard label="Receita total" value={formatBRL(stats.totalRevenue)} subLabel="acumulado" />
        <KpiCard label="Pedidos" value={stats.totalOrders} subLabel="total" />
        <KpiCard label="Ticket médio" value={formatBRL(stats.averageOrderValue)} subLabel="por pedido" />
        <KpiCard label="Clientes" value={stats.totalCustomers} subLabel="cadastrados" />
      </div>

      {/* KPI Cards — secondary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 24 }}>
        <KpiCard
          label="Carrinhos abandonados"
          value={stats.abandonedCarts}
          subLabel="sem compra há +1h"
          trendDirection={stats.abandonedCarts > 0 ? "down" : "neutral"}
        />
        <KpiCard
          label="Taxa de conversão"
          value={`${conversionRate}%`}
          subLabel="pedidos / (pedidos + abandonados)"
          trendDirection={conversionRate > 30 ? "up" : conversionRate > 15 ? "neutral" : "down"}
        />
        <KpiCard
          label="Produtos cadastrados"
          value={stats.totalProducts}
          subLabel="ativos na loja"
        />
      </div>

      {/* Revenue chart (last 7 days) */}
      <Section title="Receita dos ultimos 7 dias" description="Valor total de pedidos por dia">
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140, padding: "10px 0" }}>
          {last7Days.map((day) => {
            const dayData = stats.dailyStats[day] || { orders: 0, revenue: 0 };
            const pct = maxDayRevenue > 0 ? (dayData.revenue / maxDayRevenue) * 100 : 0;
            const dayLabel = new Date(day + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
            return (
              <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 10, color: "#6d7175", fontWeight: 600 }}>
                  {dayData.orders > 0 ? `${dayData.orders}` : ""}
                </div>
                <div style={{ width: "100%", maxWidth: 50, height: `${Math.max(pct, 4)}%`, background: dayData.revenue > 0 ? "#008060" : "#e1e3e5", borderRadius: "4px 4px 0 0", transition: "height 0.3s", minHeight: 4 }} />
                <div style={{ fontSize: 10, color: "#6d7175" }}>{dayLabel}</div>
              </div>
            );
          })}
        </div>
      </Section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Top products */}
        <Section title="Produtos mais vendidos" description="Por quantidade vendida">
          {stats.topProducts.length === 0 ? (
            <p style={{ color: "#6d7175", fontSize: 13 }}>Nenhuma venda ainda</p>
          ) : (
            stats.topProducts.slice(0, 5).map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f1f1" }}>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: i < 3 ? "#008060" : "#e1e3e5", color: i < 3 ? "#fff" : "#6d7175", fontSize: 11, fontWeight: 700, marginRight: 10 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{p.title.slice(0, 35)}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.soldCount} vendidos</div>
                  <div style={{ fontSize: 11, color: "#6d7175" }}>{formatBRL(p.revenue || 0)}</div>
                </div>
              </div>
            ))
          )}
        </Section>

        {/* Recent orders */}
        <Section title="Pedidos recentes" description="Últimos 5 pedidos">
          {stats.recentOrders.length === 0 ? (
            <p style={{ color: "#6d7175", fontSize: 13 }}>Nenhum pedido ainda</p>
          ) : (
            stats.recentOrders.slice(0, 5).map((o) => {
              const statusMap: Record<string, { label: string; variant: StatusVariant }> = {
                pending: { label: "Pendente", variant: "pending" },
                paid: { label: "Pago", variant: "success" },
                completed: { label: "Completo", variant: "completed" },
                failed: { label: "Falhou", variant: "failed" },
                refunded: { label: "Reembolsado", variant: "warning" },
              };
              const st = statusMap[o.status] || { label: o.status, variant: "neutral" as StatusVariant };
              return (
                <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f1f1" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>#{o.displayId}</div>
                    <div style={{ fontSize: 11, color: "#6d7175" }}>{new Date(o.createdAt).toLocaleDateString("pt-BR")} · {o.itemCount} itens</div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{formatBRL(o.total)}</div>
                    <StatusBadge label={st.label} variant={st.variant} />
                  </div>
                </div>
              );
            })
          )}
        </Section>
      </div>
    </div>
  );
}
