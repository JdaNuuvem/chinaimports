interface SellerReputationProps {
  ordersDelivered?: number;
  onTimeDelivery?: boolean;
  goodService?: boolean;
  storeName?: string;
}

export default function SellerReputation({
  ordersDelivered = 1247,
  onTimeDelivery = true,
  goodService = true,
  storeName = "Imports China Brasil",
}: SellerReputationProps) {
  return (
    <div style={{ marginTop: 16 }}>
      {/* Sold and shipped by */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px", borderRadius: 6,
        background: "#f0fdf4", border: "1px solid #bbf7d0",
        marginBottom: 12, fontSize: 12,
      }}>
        <span style={{ fontSize: 14 }}>✅</span>
        <span style={{ color: "#16a34a", fontWeight: 600 }}>
          Vendido e entregue pela {storeName}
        </span>
      </div>

      {/* Reputation grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8, border: "1px solid #e5e7eb",
        borderRadius: 8, padding: 12, textAlign: "center",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#1e2d7d" }}>
            {ordersDelivered.toLocaleString("pt-BR")}+
          </span>
          <span style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.3 }}>
            Pedidos entregues nos últimos 60 dias
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, borderLeft: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb" }}>
          <span style={{ fontSize: 18 }}>{goodService ? "✅" : "⚠️"}</span>
          <span style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.3 }}>
            Presta bom atendimento
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 18 }}>{onTimeDelivery ? "✅" : "⚠️"}</span>
          <span style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.3 }}>
            Entrega dentro do prazo
          </span>
        </div>
      </div>
    </div>
  );
}
