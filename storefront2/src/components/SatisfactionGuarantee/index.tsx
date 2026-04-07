export default function SatisfactionGuarantee() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "20px 24px", borderRadius: 12,
      background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      border: "1px solid #bbf7d0",
      marginTop: 20,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "#16a34a", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, flexShrink: 0,
      }}>
        ✓
      </div>
      <div>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: "#16a34a", margin: "0 0 4px" }}>
          Garantia de Satisfação
        </h4>
        <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.5 }}>
          Se você não ficar 100% satisfeito, devolvemos seu dinheiro em até 30 dias.
          Sem perguntas, sem burocracia.
        </p>
      </div>
    </div>
  );
}
