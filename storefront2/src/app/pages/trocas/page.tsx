import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trocas e Devoluções | Imports China Brasil",
};

export default function ExchangesPage() {
  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1 className="heading h1" style={{ marginBottom: 24 }}>Trocas e Devoluções</h1>
      <div style={{ fontSize: 14, color: "var(--text-color)", lineHeight: 1.8 }}>

        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 20, marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>↩️</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, color: "#16a34a", margin: 0 }}>Primeira troca grátis!</p>
            <p style={{ margin: "4px 0 0", color: "#6b7280" }}>Você tem até 30 dias para trocar ou devolver qualquer produto.</p>
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Como solicitar uma troca ou devolução</h2>
        <ol style={{ paddingLeft: 20, marginTop: 8 }}>
          <li style={{ marginBottom: 8 }}>Acesse <a href="/account/orders" style={{ color: "var(--link-color)" }}>Meus Pedidos</a> na sua conta</li>
          <li style={{ marginBottom: 8 }}>Selecione o pedido e clique em &ldquo;Solicitar Troca/Devolução&rdquo;</li>
          <li style={{ marginBottom: 8 }}>Escolha o motivo e se deseja troca por outro tamanho/cor ou reembolso</li>
          <li style={{ marginBottom: 8 }}>Imprima a etiqueta de envio (grátis na primeira troca)</li>
          <li style={{ marginBottom: 8 }}>Poste o produto na agência dos Correios mais próxima</li>
        </ol>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Prazo</h2>
        <p>Você tem até <strong>30 dias corridos</strong> após o recebimento do produto para solicitar troca ou devolução, conforme previsto no Código de Defesa do Consumidor.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Condições</h2>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>O produto deve estar em sua embalagem original</li>
          <li>Sem sinais de uso, lavagem ou danos</li>
          <li>Com todas as etiquetas e tags</li>
          <li>Acompanhado da nota fiscal</li>
        </ul>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Reembolso</h2>
        <p>O reembolso será processado em até <strong>10 dias úteis</strong> após o recebimento do produto em nosso centro de distribuição. O valor será estornado na mesma forma de pagamento utilizada na compra.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>Produtos com defeito</h2>
        <p>Para produtos com defeito de fabricação, o prazo para troca é de <strong>90 dias</strong>. Entre em contato conosco pelo <a href="/contact" style={{ color: "var(--link-color)" }}>formulário de contato</a> com fotos do defeito.</p>
      </div>
    </div>
  );
}
