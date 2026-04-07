"use client";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/utils";
import { getThemeConfig } from "@/lib/theme-config";

export default function FreeShippingBar() {
  const { cart } = useCart();
  const config = getThemeConfig();

  if (!config.cart.showFreeShippingThreshold || !config.cart.freeShippingThreshold) return null;

  const threshold = config.cart.freeShippingThreshold;
  const subtotal = cart?.subtotal || 0;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);
  const qualified = remaining <= 0;

  return (
    <div style={{
      padding: "10px 16px",
      background: qualified ? "#f0fdf4" : "#fff8e1",
      border: `1px solid ${qualified ? "#aee9d1" : "#ffd79d"}`,
      borderRadius: 8,
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: qualified ? "#1a7346" : "#8c6e00" }}>
          {qualified ? "🎉 Parabéns! Você ganhou frete grátis!" : `🚚 Faltam ${formatMoney(remaining)} para frete grátis`}
        </span>
        <span style={{ fontSize: 11, color: "#6d7175" }}>{Math.round(progress)}%</span>
      </div>
      <div style={{ height: 6, background: "#e1e3e5", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: qualified ? "#008060" : "linear-gradient(90deg, #ffc107, #ff9800)",
          borderRadius: 3,
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}
