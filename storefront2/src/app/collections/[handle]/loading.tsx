export default function CollectionLoading() {
  return (
    <div className="container container--flush" style={{ padding: 20 }}>
      <div style={{ padding: "12px 0" }}>
        <div className="skeleton" style={{ height: 14, width: 220, borderRadius: 4 }} />
      </div>

      <div className="skeleton" style={{ height: 32, width: 240, marginBottom: 8, borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 14, width: 100, marginBottom: 24, borderRadius: 4 }} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
      }} className="featured-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
            <div className="skeleton" style={{ aspectRatio: "1/1" }} />
            <div style={{ padding: 14 }}>
              <div className="skeleton" style={{ height: 10, width: 80, marginBottom: 6, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 14, width: "85%", marginBottom: 4, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 10, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 18, width: 100, marginBottom: 12, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 36, width: "100%", borderRadius: 8 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
