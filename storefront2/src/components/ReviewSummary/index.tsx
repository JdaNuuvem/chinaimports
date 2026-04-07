interface Review {
  rating: number;
}

interface ReviewSummaryProps {
  reviews: Review[];
}

export default function ReviewSummary({ reviews }: ReviewSummaryProps) {
  if (reviews.length === 0) return null;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
  }));

  return (
    <div style={{ display: "flex", gap: 24, padding: "20px 0", borderBottom: "1px solid var(--border-color, #e1e3e5)", marginBottom: 20 }}>
      {/* Average score */}
      <div style={{ textAlign: "center", minWidth: 100 }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#202223", lineHeight: 1 }}>
          {average.toFixed(1)}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 2, margin: "8px 0" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} style={{ fontSize: 16, color: star <= Math.round(average) ? "var(--star-color, #f59e0b)" : "#e5e7eb" }}>
              ★
            </span>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          {reviews.length} avaliação{reviews.length !== 1 ? "ões" : ""}
        </div>
      </div>

      {/* Distribution bars */}
      <div style={{ flex: 1 }}>
        {distribution.map((d) => (
          <div key={d.star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#6b7280", width: 16, textAlign: "right" }}>{d.star}</span>
            <span style={{ fontSize: 12, color: "#f59e0b" }}>★</span>
            <div style={{ flex: 1, height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${d.percentage}%`,
                background: d.star >= 4 ? "#16a34a" : d.star === 3 ? "#f59e0b" : "#dc2626",
                borderRadius: 4,
                transition: "width 0.5s",
              }} />
            </div>
            <span style={{ fontSize: 11, color: "#9ca3af", width: 24, textAlign: "right" }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
