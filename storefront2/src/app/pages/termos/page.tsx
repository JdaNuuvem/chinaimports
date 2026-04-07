import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Imports China Brasil",
};

export default function TermsPage() {
  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1 className="heading h1" style={{ marginBottom: 24 }}>Termos de Uso</h1>
      <div style={{ fontSize: 14, color: "var(--text-color)", lineHeight: 1.8 }}>
        <p><strong>Última atualização:</strong> Março de 2026</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>1. Aceitação dos Termos</h2>
        <p>Ao acessar e utilizar este site, você concorda com estes Termos de Uso e nossa Política de Privacidade. Se você não concordar, por favor, não utilize nossos serviços.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>2. Produtos e Preços</h2>
        <p>Todos os preços são exibidos em Reais (BRL) e incluem os impostos aplicáveis. Nos reservamos o direito de alterar preços sem aviso prévio. Promoções possuem prazo de validade e estoque limitado.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>3. Conta do Usuário</h2>
        <p>Você é responsável por manter a confidencialidade da sua conta e senha. Notifique-nos imediatamente sobre qualquer uso não autorizado da sua conta.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>4. Pedidos e Pagamentos</h2>
        <p>Ao realizar um pedido, você declara que as informações fornecidas são verdadeiras e completas. Nos reservamos o direito de cancelar pedidos em caso de suspeita de fraude.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>5. Propriedade Intelectual</h2>
        <p>Todo o conteúdo deste site, incluindo textos, imagens, logos e marcas registradas, é propriedade da Imports China Brasil ou de seus licenciadores e está protegido por leis de propriedade intelectual.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>6. Limitação de Responsabilidade</h2>
        <p>Não nos responsabilizamos por danos indiretos, consequenciais ou incidentais resultantes do uso ou incapacidade de uso deste site.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>7. Lei Aplicável</h2>
        <p>Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida no foro da comarca de São Paulo, SP.</p>
      </div>
    </div>
  );
}
