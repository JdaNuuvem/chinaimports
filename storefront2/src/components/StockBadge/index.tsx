interface StockBadgeProps {
  quantity: number;
  lowStockThreshold?: number;
}

export default function StockBadge({ quantity, lowStockThreshold = 5 }: StockBadgeProps) {
  if (quantity <= 0) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600,
        background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
      }}>
        Esgotado
      </span>
    );
  }

  if (quantity <= lowStockThreshold) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600,
        background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a",
      }}>
        Últimas {quantity} unidades!
      </span>
    );
  }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600,
      background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
    }}>
      Em estoque
    </span>
  );
}
