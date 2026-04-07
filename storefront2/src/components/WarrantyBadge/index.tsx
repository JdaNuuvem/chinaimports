interface WarrantyBadgeProps {
  warrantyDays?: number;
  returnDays?: number;
}

export default function WarrantyBadge({ warrantyDays = 90, returnDays = 30 }: WarrantyBadgeProps) {
  return (
    <div style={{
      display: "flex", gap: 12, flexWrap: "wrap",
      marginTop: 12, padding: "12px 0",
      borderTop: "1px solid var(--border-color, #e1e3e5)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 14px", borderRadius: 8,
        background: "#f0fdf4", border: "1px solid #bbf7d0",
      }}>
        <span style={{ fontSize: 20 }}>🛡️</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>Garantia {warrantyDays} dias</div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>Contra defeitos de fabricação</div>
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 14px", borderRadius: 8,
        background: "#eff6ff", border: "1px solid #bfdbfe",
      }}>
        <span style={{ fontSize: 20 }}>↩️</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>Devolução grátis</div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>Até {returnDays} dias após recebimento</div>
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 14px", borderRadius: 8,
        background: "#fefce8", border: "1px solid #fde68a",
      }}>
        <span style={{ fontSize: 20 }}>✅</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#a16207" }}>Produto original</div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>100% autêntico e importado</div>
        </div>
      </div>
    </div>
  );
}
