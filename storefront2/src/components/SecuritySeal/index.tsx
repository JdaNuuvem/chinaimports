export default function SecuritySeal() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "20px 16px", gap: 12,
    }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {/* SSL */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 6,
          border: "1px solid #e5e7eb", background: "#fff",
        }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a" }}>SSL SECURE</div>
            <div style={{ fontSize: 8, color: "#9ca3af" }}>256-bit encryption</div>
          </div>
        </div>

        {/* PCI DSS */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 6,
          border: "1px solid #e5e7eb", background: "#fff",
        }}>
          <span style={{ fontSize: 18 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#2563eb" }}>PCI DSS</div>
            <div style={{ fontSize: 8, color: "#9ca3af" }}>Compliant</div>
          </div>
        </div>

        {/* LGPD */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 6,
          border: "1px solid #e5e7eb", background: "#fff",
        }}>
          <span style={{ fontSize: 18 }}>📋</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed" }}>LGPD</div>
            <div style={{ fontSize: 8, color: "#9ca3af" }}>Em conformidade</div>
          </div>
        </div>

        {/* Anti-fraud */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px", borderRadius: 6,
          border: "1px solid #e5e7eb", background: "#fff",
        }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#dc2626" }}>ANTI-FRAUDE</div>
            <div style={{ fontSize: 8, color: "#9ca3af" }}>Proteção ativa</div>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", margin: 0 }}>
        Suas informações pessoais e de pagamento são protegidas com a mais avançada tecnologia de segurança.
      </p>
    </div>
  );
}
