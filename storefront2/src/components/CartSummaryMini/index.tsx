"use client";

import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/utils";

export default function CartSummaryMini() {
  const { cart } = useCart();

  if (!cart?.items?.length) return null;

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const freeShippingThreshold = 29900;
  const remaining = Math.max(0, freeShippingThreshold - cart.subtotal);

  return (
    <div style={{
      padding: "12px 16px",
      background: "#f9fafb",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          {itemCount} {itemCount === 1 ? "item" : "itens"}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700 }}>
          {formatMoney(cart.subtotal)}
        </span>
      </div>

      {remaining > 0 ? (
        <div style={{ fontSize: 11, color: "#92400e", background: "#fffbeb", padding: "4px 8px", borderRadius: 4, textAlign: "center" }}>
          Faltam {formatMoney(remaining)} para frete grátis
        </div>
      ) : (
        <div style={{ fontSize: 11, color: "#16a34a", background: "#f0fdf4", padding: "4px 8px", borderRadius: 4, textAlign: "center", fontWeight: 600 }}>
          🎉 Frete grátis!
        </div>
      )}
    </div>
  );
}
