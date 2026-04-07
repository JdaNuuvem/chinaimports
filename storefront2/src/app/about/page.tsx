import ImageWithText from "@/components/ImageWithText";

export default function AboutPage() {
  return (
    <div style={{ padding: "40px 0" }}>
      <div className="container" style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 className="heading h1" style={{ marginBottom: "15px" }}>Sobre a Imports China Brasil</h1>
        <p style={{ color: "#666", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
          Produtos importados com os melhores preços e entrega rápida para todo o Brasil.
        </p>
      </div>

      <ImageWithText
        title="Nossa Missão"
        content="<p>A Imports China Brasil nasceu com o objetivo de trazer produtos de qualidade internacional diretamente para o consumidor brasileiro, com preços acessíveis e atendimento de excelência.</p><p>Trabalhamos com as melhores marcas e fornecedores para garantir produtos originais com os melhores preços do mercado.</p>"
        image="/uploads/banner-3.jpg"
        imagePosition="left"
        buttonText="Ver produtos"
        buttonLink="/collections/all"
      />

      <div style={{ padding: "40px 0" }}>
        <ImageWithText
          title="Qualidade e Variedade"
          content="<p><strong>Smartphones</strong> — As melhores marcas com até 80% de desconto.</p><p><strong>Eletrônicos</strong> — Gadgets, acessórios e muito mais com entrega Full.</p><p><strong>Frete Grátis</strong> — Para compras acima de R$ 299 para todo o Brasil.</p>"
          image="/uploads/banner-1.jpg"
          imagePosition="right"
          buttonText="Explorar produtos"
          buttonLink="/collections/all"
        />
      </div>

      <div className="container" style={{ textAlign: "center", padding: "60px 0", background: "var(--secondary-background, #f5f5f5)", borderRadius: "12px", margin: "0 auto 40px", maxWidth: "1400px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "30px", maxWidth: "800px", margin: "0 auto" }}>
          {[
            { number: "1000+", label: "Produtos" },
            { number: "50K+", label: "Clientes" },
            { number: "48h", label: "Entrega Full" },
            { number: "#1", label: "Em importados" },
          ].map((stat) => (
            <div key={stat.label}>
              <p style={{ fontSize: "36px", fontWeight: 700, color: "var(--accent-color, #1e2d7d)", margin: 0 }}>{stat.number}</p>
              <p style={{ fontSize: "14px", color: "#888", marginTop: "5px" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
