import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Imports China Brasil",
};

export default function PrivacyPage() {
  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1 className="heading h1" style={{ marginBottom: 24 }}>Política de Privacidade</h1>
      <div style={{ fontSize: 14, color: "var(--text-color)", lineHeight: 1.8 }}>
        <p><strong>Última atualização:</strong> Março de 2026</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>1. Coleta de Dados</h2>
        <p>Coletamos informações pessoais que você nos fornece diretamente, como nome, endereço de e-mail, endereço de entrega, telefone e informações de pagamento quando você realiza uma compra, cria uma conta ou nos contata.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>2. Uso das Informações</h2>
        <p>Utilizamos suas informações para:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Processar pedidos e pagamentos</li>
          <li>Enviar atualizações sobre seus pedidos</li>
          <li>Comunicar promoções e novidades (com seu consentimento)</li>
          <li>Melhorar nossos serviços e experiência do usuário</li>
          <li>Cumprir obrigações legais</li>
        </ul>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>3. Compartilhamento de Dados</h2>
        <p>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Processadores de pagamento (para completar transações)</li>
          <li>Transportadoras (para entrega de pedidos)</li>
          <li>Quando exigido por lei ou ordem judicial</li>
        </ul>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>4. Proteção de Dados (LGPD)</h2>
        <p>Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018), garantimos:</p>
        <ul style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>Direito de acesso aos seus dados pessoais</li>
          <li>Direito de correção de dados incompletos ou desatualizados</li>
          <li>Direito de exclusão dos seus dados</li>
          <li>Direito de portabilidade</li>
          <li>Direito de revogar consentimento</li>
        </ul>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>5. Cookies</h2>
        <p>Utilizamos cookies para melhorar sua experiência de navegação, lembrar suas preferências e analisar o tráfego do site. Você pode gerenciar as configurações de cookies no seu navegador.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>6. Segurança</h2>
        <p>Empregamos medidas de segurança técnicas e organizacionais para proteger seus dados, incluindo criptografia SSL 256-bit, servidores seguros e acesso restrito a informações pessoais.</p>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>7. Contato</h2>
        <p>Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato conosco através da nossa <a href="/contact" style={{ color: "var(--link-color)" }}>página de contato</a>.</p>
      </div>
    </div>
  );
}
