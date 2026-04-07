interface InfoItem {
  icon: string;
  title: string;
  description: string;
}

interface InfoBarProps {
  items?: InfoItem[];
  backgroundColor?: string;
  textColor?: string;
}

const DEFAULT_ITEMS: InfoItem[] = [
  { icon: "🚚", title: "Frete Grátis", description: "Para compras acima de R$ 299" },
  { icon: "🔄", title: "Troca Grátis", description: "Primeira troca por nossa conta" },
  { icon: "🔒", title: "Compra Segura", description: "Ambiente 100% protegido" },
  { icon: "💳", title: "Até 6x sem juros", description: "Parcele suas compras" },
];

export default function InfoBar({ items = DEFAULT_ITEMS, backgroundColor = "#ffffff", textColor = "#000" }: InfoBarProps) {
  return (
    <section id="barra-informacoes" style={{ background: backgroundColor, color: textColor, padding: "30px 0" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {items.map((item, i) => (
            <div key={i} className="barra-informacoes-item" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ fontSize: "32px" }}>{item.icon}</span>
              <div>
                <span style={{ fontWeight: 500, fontSize: "calc(var(--base-text-font-size, 15px) + 2px)" }}>
                  {item.title}
                </span>
                <div style={{ lineHeight: 1.3, fontSize: "13px", opacity: 0.8 }}>
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
