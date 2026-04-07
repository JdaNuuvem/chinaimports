export default function BuyerProtection() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px", borderRadius: 8,
      background: "#eff6ff", border: "1px solid #bfdbfe",
      marginTop: 12,
    }}>
      <span style={{ fontSize: 20 }}>🛡️</span>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", margin: 0 }}>
          Proteção ao Comprador
        </p>
        <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0" }}>
          Seu pagamento é 100% seguro. Receba o produto ou seu dinheiro de volta.
        </p>
      </div>
    </div>
  );
}
