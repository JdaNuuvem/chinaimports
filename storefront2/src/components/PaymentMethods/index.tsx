interface PaymentMethodsProps {
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

const METHODS = [
  { name: "Visa", svg: "💳" },
  { name: "Mastercard", svg: "💳" },
  { name: "Elo", svg: "💳" },
  { name: "Amex", svg: "💳" },
  { name: "PIX", svg: "🏦" },
  { name: "Boleto", svg: "📄" },
];

const SIZES = { sm: 24, md: 32, lg: 40 };

export default function PaymentMethods({ size = "md", showLabels = false }: PaymentMethodsProps) {
  const s = SIZES[size];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size === "sm" ? 4 : 8, flexWrap: "wrap" }}>
      {METHODS.map((m) => (
        <div
          key={m.name}
          title={m.name}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: s * 1.6, height: s,
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: size === "sm" ? 3 : 4,
            fontSize: size === "sm" ? 12 : size === "md" ? 16 : 20,
          }}
        >
          {m.svg}
          {showLabels && <span style={{ fontSize: 9, marginLeft: 2 }}>{m.name}</span>}
        </div>
      ))}
    </div>
  );
}
