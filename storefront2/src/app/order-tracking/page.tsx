"use client";

import { useState, type FormEvent } from "react";

interface TrackingOrder {
  displayId: number;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  total: number;
  createdAt: string;
  tags?: Record<string, unknown> | null;
  items: { title: string; quantity: number }[];
}

const STATUS_STEPS = [
  { key: "pending", label: "Pendente", icon: "⏳" },
  { key: "confirmed", label: "Confirmado", icon: "✓" },
  { key: "processing", label: "Em Preparação", icon: "📦" },
  { key: "shipped", label: "Enviado", icon: "🚚" },
  { key: "fulfilled", label: "Entregue", icon: "✅" },
];

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSearched(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      const cleanId = orderId.replace("#", "").trim();
      const res = await fetch(`${backendUrl}/store/orders/${cleanId}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
        setError("Pedido não encontrado. Verifique o número e tente novamente.");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const getActiveStepIndex = (order: TrackingOrder): number => {
    const fulfillment = order.fulfillmentStatus;
    const status = order.status;
    if (fulfillment === "fulfilled") return 4;
    if (fulfillment === "shipped") return 3;
    if (status === "processing" || status === "confirmed") return status === "processing" ? 2 : 1;
    if (status === "cancelled") return -1;
    return 0;
  };

  const trackingData = (order?.tags as Record<string, unknown>)?.tracking as Record<string, unknown> | null || null;
  const trackingCode = (trackingData?.code as string) || null;
  const trackingEvents: Array<{ status: string; date: string; location: string; description: string }> = (trackingData?.events as Array<{ status: string; date: string; location: string; description: string }>) || [];

  return (
    <div className="container" style={{ padding: "60px 20px", maxWidth: 640, margin: "0 auto" }}>
      <h1 className="heading h2" style={{ textAlign: "center", marginBottom: 8 }}>Rastrear Pedido</h1>
      <p style={{ textAlign: "center", color: "var(--text-color)", marginBottom: 32 }}>
        Informe o número do seu pedido para acompanhar o status.
      </p>

      <form onSubmit={handleTrack} style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <input
          type="text"
          required
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Ex: 1001"
          style={{ flex: 1, padding: "12px 14px", border: "1px solid var(--border-color, #e1e3e5)", borderRadius: 8, fontSize: 14 }}
        />
        <button
          type="submit"
          disabled={loading}
          className="button button--primary"
          style={{ padding: "12px 24px", cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
        >
          {loading ? "Buscando..." : "Rastrear"}
        </button>
      </form>

      {error && <p style={{ color: "#e53e3e", textAlign: "center", marginBottom: 24 }}>{error}</p>}

      {order && (
        <div style={{ background: "#f9fafb", borderRadius: 12, padding: 24, border: "1px solid var(--border-color, #e1e3e5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Pedido</p>
              <p style={{ fontSize: 20, fontWeight: 700 }}>#{order.displayId}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Realizado em</p>
              <p style={{ fontSize: 14 }}>{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: 32 }}>
            {/* Progress line */}
            <div style={{ position: "absolute", top: 16, left: 32, right: 32, height: 3, background: "#e5e7eb", zIndex: 0 }} />
            <div style={{
              position: "absolute", top: 16, left: 32, height: 3, zIndex: 1,
              background: "#16a34a",
              width: `${Math.max(0, getActiveStepIndex(order)) / (STATUS_STEPS.length - 1) * (100 - 10)}%`,
              transition: "width 0.5s",
            }} />

            {STATUS_STEPS.map((step, i) => {
              const active = i <= getActiveStepIndex(order);
              return (
                <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: active ? "#16a34a" : "#e5e7eb", color: active ? "#fff" : "#9ca3af", fontSize: 16, fontWeight: 700,
                    transition: "all 0.3s",
                  }}>
                    {active ? step.icon : i + 1}
                  </div>
                  <span style={{ fontSize: 11, color: active ? "#16a34a" : "#9ca3af", marginTop: 6, fontWeight: active ? 600 : 400, textAlign: "center" }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {trackingCode && (
            <div style={{ background: "#dbeafe", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#1e40af", margin: 0 }}>Código de rastreio — {String(trackingData?.carrier || "Correios")}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#1e40af", fontFamily: "monospace", margin: "4px 0 0" }}>{trackingCode}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(trackingCode); }} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #1e40af", background: "#fff", color: "#1e40af", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                  Copiar
                </button>
              </div>
            </div>
          )}

          {/* Tracking events timeline */}
          {trackingEvents.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>Histórico de rastreio</p>
              {trackingEvents.map((event, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === 0 ? "#16a34a" : "#d1d5db", flexShrink: 0 }} />
                    {i < trackingEvents.length - 1 && <div style={{ width: 2, flex: 1, background: "#e5e7eb", minHeight: 30 }} />}
                  </div>
                  <div style={{ paddingBottom: 16, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{event.description}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{event.location}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                      {new Date(event.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontWeight: 600, marginBottom: 8 }}>Itens</p>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14 }}>
              <span>{item.title}</span>
              <span style={{ color: "#6b7280" }}>× {item.quantity}</span>
            </div>
          ))}

          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
            <span>Total</span>
            <span>R$ {(order.total / 100).toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      )}

      {searched && !order && !error && !loading && (
        <p style={{ textAlign: "center", color: "#6b7280" }}>Nenhum pedido encontrado.</p>
      )}
    </div>
  );
}
