import { formatMoney } from "@/lib/utils";

interface SavingsCalculatorProps {
  originalPrice: number;
  salePrice: number;
}

export default function SavingsCalculator({ originalPrice, salePrice }: SavingsCalculatorProps) {
  if (!originalPrice || originalPrice <= salePrice) return null;

  const savings = originalPrice - salePrice;
  const percent = Math.round((savings / originalPrice) * 100);

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 12px", borderRadius: 6,
      background: "#f0fdf4", border: "1px solid #bbf7d0",
      fontSize: 13, fontWeight: 700, color: "#16a34a",
    }}>
      💰 Economize {formatMoney(savings)} ({percent}% OFF)
    </div>
  );
}
