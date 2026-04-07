import { formatMoney } from "@/lib/utils";

interface PixDiscountProps {
  price: number; // centavos
  discountPercent?: number;
}

export default function PixDiscount({ price, discountPercent = 5 }: PixDiscountProps) {
  const pixPrice = Math.round(price * (1 - discountPercent / 100));

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 14px", borderRadius: 8,
      background: "#f0fdf4", border: "1px solid #bbf7d0",
      marginTop: 8,
    }}>
      <span style={{ fontSize: 20 }}>🏦</span>
      <div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>
          {formatMoney(pixPrice)} no PIX
        </span>
        <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 6 }}>
          ({discountPercent}% de desconto)
        </span>
      </div>
    </div>
  );
}
