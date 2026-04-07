export default function TrustBadges() {
  const badges = [
    { icon: "🔒", label: "Compra Segura", sub: "SSL 256-bit" },
    { icon: "🛡️", label: "Garantia", sub: "90 dias" },
    { icon: "↩️", label: "Devolução", sub: "30 dias grátis" },
    { icon: "💳", label: "Até 10x", sub: "sem juros" },
  ];

  return (
    <div style={{
      display: "flex", justifyContent: "center", gap: 16,
      padding: "12px 0", marginTop: 16,
      borderTop: "1px solid var(--border-color, #e1e3e5)",
      flexWrap: "wrap",
    }}>
      {badges.map((b) => (
        <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-color, #677279)" }}>
          <span style={{ fontSize: 16 }}>{b.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 11 }}>{b.label}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>{b.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
