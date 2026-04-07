"use client";

import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/utils";

interface Tier {
  minAmount: number; // centavos
  discount: number; // percent
  label: string;
}

const DEFAULT_TIERS: Tier[] = [
  { minAmount: 19900, discount: 5, label: "5% OFF acima de R$ 199" },
  { minAmount: 29900, discount: 10, label: "10% OFF acima de R$ 299" },
  { minAmount: 49900, discount: 15, label: "15% OFF acima de R$ 499" },
];

export default function ProgressiveDiscount({ tiers = DEFAULT_TIERS }: { tiers?: Tier[] }) {
  const { cart } = useCart();
  const subtotal = cart?.subtotal || 0;

  const activeTier = [...tiers].reverse().find((t) => subtotal >= t.minAmount);
  const nextTier = tiers.find((t) => subtotal < t.minAmount);

  if (subtotal === 0) return null;

  return (
    <div style={{
      padding: "12px 16px",
      background: activeTier ? "#f0fdf4" : "#fffbeb",
      border: `1px solid ${activeTier ? "#bbf7d0" : "#fde68a"}`,
      borderRadius: 8,
      marginBottom: 12,
    }}>
      {activeTier ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <span style={{ fontSize: 16 }}>🎉</span>
          <span style={{ fontWeight: 700, color: "#16a34a" }}>
            {activeTier.discount}% de desconto aplicado!
          </span>
          <span style={{ color: "#6b7280" }}>
            (economia de {formatMoney(Math.round(subtotal * activeTier.discount / 100))})
          </span>
        </div>
      ) : (
        <div style={{ fontSize: 13 }}>
          <span style={{ color: "#92400e" }}>
            Adicione mais {formatMoney(nextTier!.minAmount - subtotal)} para ganhar {nextTier!.discount}% OFF
          </span>
        </div>
      )}

      {/* Tier indicators */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {tiers.map((tier) => (
          <div
            key={tier.minAmount}
            style={{
              flex: 1, textAlign: "center", padding: "4px 0",
              borderRadius: 4, fontSize: 10,
              background: subtotal >= tier.minAmount ? "#16a34a" : "#f0f0f0",
              color: subtotal >= tier.minAmount ? "#fff" : "#9ca3af",
              fontWeight: subtotal >= tier.minAmount ? 700 : 400,
            }}
          >
            {tier.discount}% OFF
          </div>
        ))}
      </div>
    </div>
  );
}
