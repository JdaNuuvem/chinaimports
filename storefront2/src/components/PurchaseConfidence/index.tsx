interface PurchaseConfidenceProps {
  soldCount?: number;
  viewCount?: number;
  rating?: number;
  reviewCount?: number;
}

export default function PurchaseConfidence({ soldCount = 1247, viewCount = 89, rating = 4.8, reviewCount = 342 }: PurchaseConfidenceProps) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
      marginTop: 12,
    }}>
      <Stat icon="🛒" value={`${soldCount.toLocaleString("pt-BR")}+`} label="Vendidos" />
      <Stat icon="👀" value={String(viewCount)} label="Vendo agora" pulse />
      <Stat icon="⭐" value={rating.toFixed(1)} label={`${reviewCount} avaliações`} />
      <Stat icon="💯" value="100%" label="Satisfação" />
    </div>
  );
}

function Stat({ icon, value, label, pulse }: { icon: string; value: string; label: string; pulse?: boolean }) {
  return (
    <div style={{
      textAlign: "center", padding: "8px 4px",
      background: "#f9fafb", borderRadius: 8,
      border: "1px solid #e5e7eb",
    }}>
      <div style={{ fontSize: 16, marginBottom: 2 }}>
        {pulse && (
          <span style={{
            display: "inline-block", width: 6, height: 6, borderRadius: "50%",
            background: "#16a34a", marginRight: 4, verticalAlign: "middle",
          }} />
        )}
        {icon}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#202223" }}>{value}</div>
      <div style={{ fontSize: 9, color: "#9ca3af" }}>{label}</div>
    </div>
  );
}
