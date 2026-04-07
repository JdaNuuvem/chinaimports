import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Envio | Imports China Brasil",
};

export default function ShippingPolicyPage() {
  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1 className="heading h1" style={{ marginBottom: 24 }}>Política de Envio</h1>
      <div style={{ fontSize: 14, color: "var(--text-color)", lineHeight: 1.8 }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 20, textAlign: "center" }}>
            <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>🚚</span>
            <p style={{ fontWeight: 700, color: "#16a34a", margin: 0 }}>Frete Grátis</p>
            <p style={{ color: "#6b7280", margin: "4px 0 0", fontSize: 13 }}>Acima de R$ 299</p>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 20, textAlign: "center" }}>
            <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>📦</span>
            <p style={{ fontWeight: 700, color: "#2563eb", margin: 0 }}>Entrega Expressa</p>
            <p style={{ color: "#6b7280", margin: "4px 0 0", fontSize: 13 }}>A partir de 1 dia útil</p>
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Prazo de Entrega</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "2px solid #e5e7eb", fontSize: 13 }}>Região</th>
              <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "2px solid #e5e7eb", fontSize: 13 }}>Prazo</th>
              <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "2px solid #e5e7eb", fontSize: 13 }}>Frete</th>
            </tr>
          </thead>
          <tbody>
            {[
              { region: "SP Capital", days: "1-3 dias úteis", price: "Grátis acima de R$ 299" },
              { region: "SP Interior / RJ / MG / ES", days: "3-5 dias úteis", price: "Grátis acima de R$ 299" },
              { region: "Sul (PR, SC, RS)", days: "4-6 dias úteis", price: "Grátis acima de R$ 299" },
              { region: "Nordeste", days: "5-8 dias úteis", price: "A partir de R$ 14,90" },
              { region: "Norte / Centro-Oeste", days: "6-10 dias úteis", price: "A partir de R$ 19,90" },
            ].map((row) => (
              <tr key={row.region} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 12px", fontSize: 13 }}>{row.region}</td>
                <td style={{ padding: "10px 12px", fontSize: 13 }}>{row.days}</td>
                <td style={{ padding: "10px 12px", fontSize: 13 }}>{row.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Rastreamento</h2>
        <p>Após o envio, você receberá um e-mail com o código de rastreio. Também é possível acompanhar o status do pedido em <a href="/order-tracking" style={{ color: "var(--link-color)" }}>Rastrear Pedido</a>.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Endereço de Entrega</h2>
        <p>Entregamos para todos os endereços no Brasil. Certifique-se de que o endereço de entrega está correto e completo no momento da compra. Não nos responsabilizamos por atrasos causados por endereços incorretos.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Tentativas de Entrega</h2>
        <p>Serão realizadas até 3 tentativas de entrega. Caso nenhuma seja bem-sucedida, o produto retornará ao nosso centro de distribuição e entraremos em contato para agendar uma nova entrega.</p>
      </div>
    </div>
  );
}
