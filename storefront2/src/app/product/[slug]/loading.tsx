export default function ProductLoading() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>
        {/* Breadcrumb skeleton */}
        <div style={{ padding: "12px 0" }}>
          <div className="skeleton" style={{ height: 14, width: 220, borderRadius: 4 }} />
        </div>

        {/* Two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          {/* Gallery */}
          <div>
            <div className="skeleton" style={{ aspectRatio: "1/1", borderRadius: 12, marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton" style={{ width: 64, height: 64, borderRadius: 6 }} />
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="skeleton" style={{ height: 14, width: 140, marginBottom: 12, borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 32, width: "85%", marginBottom: 10, borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 32, width: "60%", marginBottom: 16, borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 18, width: 220, marginBottom: 20, borderRadius: 4 }} />

            {/* Price block */}
            <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, marginBottom: 20 }}>
              <div className="skeleton" style={{ height: 14, width: 120, marginBottom: 10, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 36, width: 180, marginBottom: 10, borderRadius: 6 }} />
              <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 6, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 14, width: "70%", borderRadius: 4 }} />
            </div>

            {/* Description */}
            <div className="skeleton" style={{ height: 14, width: "100%", marginBottom: 6, borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 14, width: "92%", marginBottom: 6, borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 14, width: "88%", marginBottom: 20, borderRadius: 4 }} />

            {/* Variants */}
            <div className="skeleton" style={{ height: 16, width: 100, marginBottom: 10, borderRadius: 4 }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <div className="skeleton" style={{ height: 40, width: 80, borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 40, width: 100, borderRadius: 8 }} />
            </div>

            {/* CTA */}
            <div className="skeleton" style={{ height: 56, width: "100%", borderRadius: 12, marginBottom: 12 }} />

            {/* Trust badges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 80, borderRadius: 10 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
