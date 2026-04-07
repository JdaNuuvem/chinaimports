"use client";

import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/utils";
import { getThemeConfig } from "@/lib/theme-config";

export default function FreeShippingTier() {
  const { cart } = useCart();
  const config = getThemeConfig();

  if (!config.cart.showFreeShippingThreshold) return null;

  const threshold = config.cart.freeShippingThreshold || 29900;
  const subtotal = cart?.subtotal || 0;
  const remaining = Math.max(0, threshold - subtotal);
  const percentage = Math.min(100, (subtotal / threshold) * 100);
  const achieved = remaining <= 0;

  if (!cart?.items?.length) return null;

  return (
    <div style={{
      padding: "8px 20px",
      background: achieved ? "#f0fdf4" : "#fffbeb",
      borderBottom: `1px solid ${achieved ? "#bbf7d0" : "#fde68a"}`,
      fontSize: 12,
      textAlign: "center",
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {achieved ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#16a34a", fontWeight: 600 }}>
            <span>🎉</span> Parabéns! Você ganhou <strong>frete grátis</strong>!
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#92400e", marginBottom: 4 }}>
              <span>🚚</span>
              Faltam <strong>{formatMoney(remaining)}</strong> para frete grátis!
            </div>
            <div style={{ height: 4, background: "#fde68a", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${percentage}%`,
                background: percentage > 75 ? "#16a34a" : "#f59e0b",
                borderRadius: 2,
                transition: "width 0.5s ease",
              }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
