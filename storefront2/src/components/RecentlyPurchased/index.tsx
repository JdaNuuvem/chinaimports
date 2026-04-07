"use client";

import { useState, useEffect } from "react";

const CITIES = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre", "Salvador", "Brasília", "Recife", "Fortaleza", "Campinas", "Goiânia", "Florianópolis"];
const FIRST_NAMES = ["João", "Maria", "Ana", "Pedro", "Lucas", "Juliana", "Rafael", "Camila", "Gabriel", "Fernanda", "Bruno", "Larissa", "Thiago", "Carolina", "Diego"];
const TIMES = ["agora", "há 2 min", "há 5 min", "há 8 min", "há 12 min", "há 15 min", "há 20 min"];

interface RecentlyPurchasedProps {
  productNames?: string[];
  maxItems?: number;
}

export default function RecentlyPurchased({ productNames = [], maxItems = 3 }: RecentlyPurchasedProps) {
  const [purchases, setPurchases] = useState<Array<{ name: string; city: string; product: string; time: string }>>([]);

  useEffect(() => {
    const generatePurchases = () => {
      const items = [];
      const usedProducts = new Set<number>();
      const products = productNames.length > 0 ? productNames : ["Camiseta UA Tech 2.0", "Bermuda UA Launch", "Tênis UA Charged", "Mochila UA Hustle"];

      for (let i = 0; i < maxItems; i++) {
        let productIndex = Math.floor(Math.random() * products.length);
        while (usedProducts.has(productIndex) && usedProducts.size < products.length) {
          productIndex = Math.floor(Math.random() * products.length);
        }
        usedProducts.add(productIndex);

        items.push({
          name: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
          city: CITIES[Math.floor(Math.random() * CITIES.length)],
          product: products[productIndex],
          time: TIMES[i] || TIMES[TIMES.length - 1],
        });
      }
      setPurchases(items);
    };

    generatePurchases();
    const interval = setInterval(generatePurchases, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [productNames, maxItems]);

  if (purchases.length === 0) return null;

  return (
    <div style={{
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: "12px 16px",
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#16a34a",
          animation: "pulse 2s infinite",
        }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
          Compras recentes nesta coleção
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {purchases.map((p, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontSize: 12, color: "#6b7280",
            padding: "4px 0",
            borderBottom: i < purchases.length - 1 ? "1px solid #f0f0f0" : "none",
          }}>
            <div>
              <strong style={{ color: "#374151" }}>{p.name}</strong>
              <span> de {p.city} comprou </span>
              <strong style={{ color: "#374151" }}>{p.product}</strong>
            </div>
            <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap", marginLeft: 8 }}>
              {p.time}
            </span>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: "@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }" }} />
    </div>
  );
}
