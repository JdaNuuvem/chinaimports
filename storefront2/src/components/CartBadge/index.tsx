"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";

export default function CartBadge() {
  const { cart } = useCart();
  const [bounce, setBounce] = useState(false);
  const prevCount = useRef(0);

  const count = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  useEffect(() => {
    if (count > prevCount.current && prevCount.current > 0) {
      setBounce(true);
      setTimeout(() => setBounce(false), 600);
    }
    prevCount.current = count;
  }, [count]);

  if (count === 0) return null;

  return (
    <span
      style={{
        position: "absolute",
        top: -6,
        right: -6,
        background: "var(--on-sale-accent, #e22120)",
        color: "#fff",
        fontSize: 10,
        fontWeight: 800,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
        lineHeight: 1,
        transform: bounce ? "scale(1.3)" : "scale(1)",
        transition: "transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
