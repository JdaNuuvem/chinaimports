import FaqAccordion from "@/components/FaqAccordion";
import { FaqJsonLd } from "@/components/JsonLd";

export const metadata = {
  title: "FAQ | Imports China Brasil",
  description: "Perguntas frequentes sobre pedidos, entregas, trocas e devoluções.",
};

const FAQ_ITEMS = [
  { question: "Qual o prazo de entrega?", answer: "O prazo de entrega varia de 3 a 10 dias úteis, dependendo da sua região. Após a confirmação do pagamento, você receberá o código de rastreio por e-mail." },
  { question: "Como faço para trocar ou devolver?", answer: "Você tem até 30 dias após o recebimento para solicitar troca ou devolução. Acesse <strong>Minha Conta > Meus Pedidos</strong> e siga as instruções." },
  { question: "Quais são as formas de pagamento?", answer: "Aceitamos cartão de crédito (parcelamento em até 10x sem juros), boleto bancário e PIX." },
  { question: "O frete é grátis?", answer: "Sim! Oferecemos frete grátis para compras acima de R$ 299 para todo o Brasil." },
  { question: "Como sei meu tamanho?", answer: "Consulte nosso <a href='/pages/guia-tamanhos'>Guia de Tamanhos</a> para encontrar o ajuste perfeito. Cada produto também possui uma tabela de medidas na página de detalhes." },
  { question: "Posso cancelar meu pedido?", answer: "Sim, desde que o pedido ainda não tenha sido enviado. Entre em contato conosco através da página de <a href='/contact'>Contato</a>." },
  { question: "Os produtos possuem garantia?", answer: "Sim, todos os produtos Imports China Brasil possuem garantia contra defeitos de fabricação por 90 dias a partir da data de recebimento." },
];

export default function FaqPage() {
  return (
    <div style={{ padding: "40px 0" }}>
      <FaqJsonLd questions={FAQ_ITEMS} />
      <FaqAccordion items={FAQ_ITEMS} title="Perguntas Frequentes" />
    </div>
  );
}
