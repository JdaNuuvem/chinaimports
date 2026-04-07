"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Section, PageHeader, KpiCard, ActionButton } from "./shared";
import { Clock, CheckCircle, PackageOpen, Truck, Plane, MapPin, PackageCheck, XCircle, RotateCcw } from "lucide-react";

const ORDER_STATUSES: Array<{ value: string; label: string; icon: ReactNode; bg: string; color: string }> = [
  { value: "pending", label: "Pendente", icon: <Clock size={18} />, bg: "#ffd79d", color: "#8c6e00" },
  { value: "confirmed", label: "Confirmado", icon: <CheckCircle size={18} />, bg: "#aee9d1", color: "#1a7346" },
  { value: "preparing", label: "Em preparação", icon: <PackageOpen size={18} />, bg: "#dfe3e8", color: "#44474a" },
  { value: "shipped", label: "Enviado", icon: <Truck size={18} />, bg: "#b4e1fa", color: "#0e5d92" },
  { value: "in_transit", label: "Em trânsito", icon: <Plane size={18} />, bg: "#b4e1fa", color: "#0e5d92" },
  { value: "out_for_delivery", label: "Saiu para entrega", icon: <MapPin size={18} />, bg: "#c9b8f7", color: "#5a2dcf" },
  { value: "delivered", label: "Entregue", icon: <PackageCheck size={18} />, bg: "#aee9d1", color: "#1a7346" },
  { value: "cancelled", label: "Cancelado", icon: <XCircle size={18} />, bg: "#fead9a", color: "#d72c0d" },
  { value: "refunded", label: "Reembolsado", icon: <RotateCcw size={18} />, bg: "#fead9a", color: "#d72c0d" },
];

export { ORDER_STATUSES };

export default function OrdersTab({ backendUrl, token }: { backendUrl: string; token?: string }) {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Auto-advance config
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [autoHours, setAutoHours] = useState(24);

  const authHeaders: HeadersInit = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };

  const load = () => {
    // Defer setState calls to next tick to avoid synchronous setState-in-effect
    Promise.resolve().then(() => {
      setLoading(true);
      fetch(`${backendUrl}/admin/orders`, { headers: authHeaders })
        .then((r) => r.json())
        .then((d) => { setOrders(d.orders || []); setLoading(false); })
        .catch(() => setLoading(false));
    });
  };

  useEffect(() => {
    fetch(`${backendUrl}/admin/orders`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders || []); setLoading(false); })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  const formatBRL = (v: number) => `R$ ${(v / 100).toFixed(2).replace(".", ",")}`;

  const getStatus = (status: string) => ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];

  const statusIndex = (status: string) => ORDER_STATUSES.findIndex((s) => s.value === status);

  const handleStatusChange = async (id: string, status: string, currentFulfillment?: string) => {
    // Map status to fulfillment
    const fulfillmentMap: Record<string, string> = {
      pending: "not_fulfilled", confirmed: "not_fulfilled", preparing: "not_fulfilled",
      shipped: "shipped", in_transit: "shipped", out_for_delivery: "shipped",
      delivered: "fulfilled", cancelled: "cancelled", refunded: "cancelled",
    };
    const fulfillment = fulfillmentMap[status] || currentFulfillment || "not_fulfilled";

    await fetch(`${backendUrl}/admin/orders/${id}`, {
      method: "PUT", headers: authHeaders,
      body: JSON.stringify({ status, fulfillmentStatus: fulfillment }),
    });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status, fulfillmentStatus: fulfillment } : o));
    setMsg({ text: `Pedido atualizado para "${getStatus(status).label}"`, type: "success" });
    setTimeout(() => setMsg(null), 3000);
  };

  // Auto-advance timer
  useEffect(() => {
    if (!autoAdvance) return;
    const interval = setInterval(() => {
      const now = Date.now();
      orders.forEach(async (o) => {
        const createdAt = new Date(o.createdAt as string).getTime();
        const hoursOld = (now - createdAt) / 3600000;
        const nextStatus: Record<string, string> = {
          confirmed: "preparing",
          preparing: "shipped",
          shipped: "in_transit",
          in_transit: "out_for_delivery",
          out_for_delivery: "delivered",
        };
        const next = nextStatus[o.status as string];
        if (next && hoursOld > autoHours) {
          await handleStatusChange(o.id as string, next, o.fulfillmentStatus as string);
        }
      });
    }, 60000); // check every minute
    return () => clearInterval(interval);
  }, [autoAdvance, autoHours, orders]);

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle="Gerencie os pedidos da sua loja"
        actions={
          <>
            <ActionButton variant="secondary" onClick={load}>Atualizar</ActionButton>
            <ActionButton variant="secondary">Exportar CSV</ActionButton>
          </>
        }
      />

      {msg && (
        <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13, background: msg.type === "success" ? "#f1f8f5" : "#fef3f2", color: msg.type === "success" ? "#1a7346" : "#d72c0d", border: `1px solid ${msg.type === "success" ? "#aee9d1" : "#fead9a"}`, display: "flex", alignItems: "center", gap: 8 }}>
          {msg.type === "success" ? "✓" : "✕"} {msg.text}
        </div>
      )}

      {/* KPI summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Total" value={orders.length} />
        <KpiCard label="Pendentes" value={orders.filter((o) => o.status === "pending").length} subLabel="aguardando" />
        <KpiCard label="Em preparação" value={orders.filter((o) => o.status === "preparing" || o.status === "confirmed").length} />
        <KpiCard label="Enviados" value={orders.filter((o) => ["shipped", "in_transit", "out_for_delivery"].includes(o.status as string)).length} />
        <KpiCard label="Entregues" value={orders.filter((o) => o.status === "delivered").length} trendDirection="up" />
      </div>

      {/* Auto-advance config */}
      <Section title="Avanço automático de status" description="Avança o status dos pedidos automaticamente após um período configurado">
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} />
            <span style={{ fontWeight: 600 }}>Ativar avanço automático</span>
          </label>
          {autoAdvance && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
              <span>Avançar a cada</span>
              <input type="number" value={autoHours} onChange={(e) => setAutoHours(Number(e.target.value))} min={1} max={720} style={{ width: 60, padding: "4px 8px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 13, textAlign: "center" }} />
              <span>horas</span>
            </div>
          )}
        </div>
        {autoAdvance && (
          <p style={{ fontSize: 12, color: "#6d7175", marginTop: 8 }}>
            Fluxo: Confirmado → Em preparação → Enviado → Em trânsito → Saiu para entrega → Entregue
          </p>
        )}
      </Section>

      {/* Orders list */}
      <Section title="Todos os pedidos" description={`${orders.length} pedidos realizados`}>
        {loading ? <p style={{ color: "#6d7175" }}>Carregando...</p> : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{"\�\�"}</div>
            <p style={{ color: "#6d7175", fontSize: 14 }}>Nenhum pedido realizado ainda</p>
          </div>
        ) : (
          <div>
            {orders.map((o) => {
              const st = getStatus(o.status as string);
              const customer = o.customer as Record<string, string> | null;
              const items = (o.items as Array<Record<string, unknown>>) || [];
              const isExpanded = expanded === (o.id as string);
              const address = o.shippingAddress ? (typeof o.shippingAddress === "string" ? (() => { try { return JSON.parse(o.shippingAddress as string); } catch { return null; } })() : o.shippingAddress) as Record<string, string> | null : null;

              return (
                <div key={o.id as string} style={{ border: "1px solid #e1e3e5", borderRadius: 10, marginBottom: 10, overflow: "hidden", background: "#fff" }}>
                  {/* Order header - click to expand */}
                  <div
                    onClick={() => setExpanded(isExpanded ? null : (o.id as string))}
                    style={{ display: "grid", gridTemplateColumns: "70px 1fr 100px 130px 40px", gap: 10, padding: "14px 16px", alignItems: "center", cursor: "pointer", background: isExpanded ? "#f9fafb" : "#fff" }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>#{String(o.displayId)}</div>
                      <div style={{ fontSize: 10, color: "#8c9196" }}>{new Date(o.createdAt as string).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <div style={{ fontSize: 13, color: "#202223" }}>
                      {customer ? `${customer.firstName} ${customer.lastName}` : "Cliente Luna"}
                      {typeof o.stripePaymentId === "string" && o.stripePaymentId.startsWith("luna_") && <span style={{ marginLeft: 6, fontSize: 9, padding: "1px 6px", borderRadius: 8, background: "#e8d5f5", color: "#6d28d9", fontWeight: 600 }}>LUNA</span>}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{formatBRL(o.total as number)}</div>
                    <div>
                      <span style={{ padding: "4px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 16, color: "#8c9196", textAlign: "center" }}>{isExpanded ? "▲" : "▼"}</div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid #e1e3e5" }}>
                      {/* Status timeline */}
                      <div style={{ padding: "16px 0" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Alterar status</div>
                        <div style={{ display: "flex", gap: 0, overflow: "auto" }}>
                          {ORDER_STATUSES.filter((s) => !["refunded"].includes(s.value)).map((s, i) => {
                            const isCurrent = s.value === (o.status as string);
                            const isPast = statusIndex(o.status as string) > i;
                            return (
                              <button
                                key={s.value}
                                onClick={() => handleStatusChange(o.id as string, s.value, o.fulfillmentStatus as string)}
                                style={{
                                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                                  padding: "8px 10px", border: "none", cursor: "pointer",
                                  background: isCurrent ? s.bg : "transparent",
                                  borderRadius: 8, minWidth: 80, transition: "background 0.15s",
                                  opacity: isPast ? 0.5 : 1,
                                }}
                              >
                                <span style={{ fontSize: 18 }}>{s.icon}</span>
                                <span style={{ fontSize: 10, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? s.color : "#6d7175", whiteSpace: "nowrap" }}>{s.label}</span>
                                {isCurrent && <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {/* Items */}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "#6d7175" }}>ITENS DO PEDIDO</div>
                          {items.map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f1f1", fontSize: 13 }}>
                              <span>{item.title as string} × {item.quantity as number}</span>
                              <span style={{ fontWeight: 600 }}>{formatBRL(item.total as number)}</span>
                            </div>
                          ))}
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, fontWeight: 700 }}>
                            <span>Total</span>
                            <span>{formatBRL(o.total as number)}</span>
                          </div>
                        </div>

                        {/* Customer & Address */}
                        <div>
                          {customer && (
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#6d7175" }}>CLIENTE</div>
                              <div style={{ fontSize: 13 }}>{customer.firstName} {customer.lastName}</div>
                              <div style={{ fontSize: 12, color: "#6d7175" }}>{customer.email}</div>
                            </div>
                          )}
                          {address && (
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#6d7175" }}>ENDEREÇO</div>
                              <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                                {address.address_1 || address.street}{address.address_2 || address.complement ? `, ${address.address_2 || address.complement}` : ""}<br />
                                {address.city || ""} - {address.province || address.state || ""}<br />
                                CEP: {address.postal_code || address.zipcode || ""}
                              </div>
                            </div>
                          )}
                          <div style={{ marginTop: 12 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#6d7175" }}>INFO</div>
                            <div style={{ fontSize: 12, color: "#6d7175" }}>
                              Pagamento: {o.paymentStatus as string}<br />
                              Criado: {new Date(o.createdAt as string).toLocaleString("pt-BR")}<br />
                              {typeof o.stripePaymentId === "string" && <>ID: {o.stripePaymentId}</>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions: Tracking + Auto-advance */}
                      <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid #e1e3e5", flexWrap: "wrap" }}>
                        <button
                          onClick={async () => {
                            const res = await fetch(`${backendUrl}/admin/orders/${o.id}/tracking`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
                            const data = await res.json();
                            if (data.trackingCode) { setMsg({ text: `Rastreio gerado: ${data.trackingCode}`, type: "success" }); load(); }
                            else setMsg({ text: data.error || "Erro", type: "error" });
                          }}
                          style={{ padding: "8px 16px", background: "#0e5d92", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                        >
                          📦 Gerar rastreio
                        </button>
                        <button
                          onClick={async () => {
                            const res = await fetch(`${backendUrl}/admin/orders/${o.id}/auto-advance`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ schedule: { confirmed: 0, processing: 1, shipped: 2, in_transit: 1, out_for_delivery: 3, delivered: 1 } }),
                            });
                            const data = await res.json();
                            if (data.success) { setMsg({ text: "Auto-avanço ativado (8 dias)", type: "success" }); load(); }
                            else setMsg({ text: data.error || "Erro", type: "error" });
                          }}
                          style={{ padding: "8px 16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                        >
                          ⏰ Auto-avançar
                        </button>
                        <a href={`/api/order-pdf?id=${o.displayId}`} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#202223", textDecoration: "none" }}>
                          📄 PDF
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
