"use client";

import { formatMoney } from "@/lib/utils";

interface LoyaltyPointsProps {
  price: number; // centavos
  pointsPerReal?: number; // pontos por real gasto
}

export default function LoyaltyPoints({ price, pointsPerReal = 1 }: LoyaltyPointsProps) {
  const reais = price / 100;
  const points = Math.floor(reais * pointsPerReal);

  if (points <= 0) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 12px",
      background: "linear-gradient(90deg, #fef3c7 0%, #fde68a 100%)",
      borderRadius: 6,
      marginTop: 8,
    }}>
      <span style={{ fontSize: 18 }}>🏆</span>
      <div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
          Ganhe {points} pontos
        </span>
        <span style={{ fontSize: 12, color: "#a16207" }}>
          {" "}com esta compra
        </span>
      </div>
    </div>
  );
}

export function PointsBalance({ points }: { points: number }) {
  const value = points; // 1 ponto = R$ 0.01

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 16px",
      background: "#fffbeb",
      border: "1px solid #fde68a",
      borderRadius: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 24 }}>🏆</span>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#92400e", margin: 0 }}>
            {points.toLocaleString("pt-BR")} pontos
          </p>
          <p style={{ fontSize: 12, color: "#a16207", margin: 0 }}>
            Equivalente a {formatMoney(value)}
          </p>
        </div>
      </div>
      <button style={{
        padding: "8px 14px", borderRadius: 6,
        background: "#92400e", color: "#fff",
        border: "none", fontWeight: 600, fontSize: 12,
        cursor: "pointer",
      }}>
        Usar pontos
      </button>
    </div>
  );
}
