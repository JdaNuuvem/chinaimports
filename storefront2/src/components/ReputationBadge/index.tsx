interface ReputationBadgeProps {
  rating?: number;
  source?: string;
  totalReviews?: number;
  url?: string;
}

export default function ReputationBadge({
  rating = 4.8,
  source = "Reclame Aqui",
  totalReviews = 1247,
  url = "#",
}: ReputationBadgeProps) {
  const stars = Math.round(rating);
  const badge = rating >= 4.5 ? "Ótimo" : rating >= 3.5 ? "Bom" : "Regular";
  const badgeColor = rating >= 4.5 ? "#16a34a" : rating >= 3.5 ? "#f59e0b" : "#dc2626";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "10px 16px", borderRadius: 8,
        border: "1px solid #e5e7eb", background: "#fff",
        textDecoration: "none", color: "#374151",
        transition: "box-shadow 0.2s",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: badgeColor, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 900, fontSize: 16,
      }}>
        {rating.toFixed(1)}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
          <span style={{ color: badgeColor }}>{badge}</span> no {source}
        </div>
        <div style={{ display: "flex", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} style={{ fontSize: 12, color: s <= stars ? "#f59e0b" : "#d1d5db" }}>★</span>
          ))}
          <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>
            ({totalReviews.toLocaleString("pt-BR")} avaliações)
          </span>
        </div>
      </div>
    </a>
  );
}
