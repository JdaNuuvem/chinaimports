interface BenefitsBarProps {
  items?: Array<{ icon: string; text: string }>;
  bgColor?: string;
  textColor?: string;
}

const DEFAULT_ITEMS = [
  { icon: "🚚", text: "Frete grátis acima de R$ 299" },
  { icon: "↩️", text: "Troca e devolução grátis" },
  { icon: "🔒", text: "Compra 100% segura" },
  { icon: "💳", text: "Até 10x sem juros" },
];

export default function BenefitsBar({ items = DEFAULT_ITEMS, bgColor = "#f9fafb", textColor = "#374151" }: BenefitsBarProps) {
  return (
    <div style={{
      display: "flex", justifyContent: "center", gap: 24,
      padding: "14px 20px",
      background: bgColor,
      borderBottom: "1px solid #e5e7eb",
      flexWrap: "wrap",
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: textColor }}>
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          <span style={{ fontWeight: 500 }}>{item.text}</span>
        </div>
      ))}
    </div>
  );
}
