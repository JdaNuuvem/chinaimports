interface TextWithIconItem {
  icon: string;
  title: string;
  content?: string;
}

interface TextWithIconsProps {
  items?: TextWithIconItem[];
}

const DEFAULT_ITEMS: TextWithIconItem[] = [
  { icon: "🚚", title: "Frete Grátis", content: "Acima de R$ 299" },
  { icon: "↩️", title: "Troca Grátis", content: "Até 30 dias" },
  { icon: "🔒", title: "Compra Segura", content: "Ambiente protegido" },
  { icon: "💳", title: "Parcele em 6x", content: "Sem juros" },
];

export default function TextWithIcons({ items = DEFAULT_ITEMS }: TextWithIconsProps) {
  return (
    <section className="section section--tight" data-section-type="text-with-icons" style={{ borderTop: "1px solid var(--border-color, #e0e0e0)", borderBottom: "1px solid var(--border-color, #e0e0e0)", padding: "20px 0" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px" }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0" }}>
              <span style={{ fontSize: "28px" }}>{item.icon}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: "14px", margin: 0 }}>{item.title}</p>
                {item.content && <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>{item.content}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
