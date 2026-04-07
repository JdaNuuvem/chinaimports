"use client";

import { useState } from "react";
import { fetchAddressByCep, formatCep } from "@/lib/viacep";

interface DeliveryEstimateProps {
  productWeight?: number; // grams
}

interface EstimateResult {
  method: string;
  days: string;
  price: string;
  city: string;
  state: string;
}

// Simulated delivery calculation based on region
function calculateDelivery(state: string, city: string): EstimateResult[] {
  const regionDays: Record<string, number> = {
    SP: 3, RJ: 4, MG: 4, ES: 5, PR: 4, SC: 5, RS: 5,
    BA: 6, PE: 7, CE: 7, MA: 8, PA: 9, AM: 10,
    GO: 5, DF: 5, MT: 6, MS: 5, TO: 7,
    AL: 7, SE: 7, PB: 7, RN: 7, PI: 8,
    AC: 12, AP: 12, RO: 10, RR: 12,
  };

  const baseDays = regionDays[state] || 7;

  const results: EstimateResult[] = [
    {
      method: "Frete Padrão",
      days: `${baseDays} a ${baseDays + 3} dias úteis`,
      price: baseDays <= 4 ? "Grátis" : `R$ ${(9.9 + baseDays * 1.5).toFixed(2).replace(".", ",")}`,
      city,
      state,
    },
    {
      method: "Frete Expresso",
      days: `${Math.max(1, baseDays - 2)} a ${baseDays} dias úteis`,
      price: `R$ ${(19.9 + baseDays * 2).toFixed(2).replace(".", ",")}`,
      city,
      state,
    },
  ];

  return results;
}

export default function DeliveryEstimate({ productWeight }: DeliveryEstimateProps) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState<EstimateResult[] | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEstimates(null);
    setLoading(true);

    const address = await fetchAddressByCep(cep.replace(/\D/g, ""));
    if (!address) {
      setError("CEP não encontrado");
      setLoading(false);
      return;
    }

    const results = calculateDelivery(address.uf, address.localidade);
    setEstimates(results);
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 16, padding: "14px 16px", border: "1px solid var(--border-color, #e1e3e5)", borderRadius: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>🚚</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#202223" }}>Calcular prazo de entrega</span>
      </div>

      <form onSubmit={handleCalculate} style={{ display: "flex", gap: 8, marginBottom: estimates ? 12 : 0 }}>
        <input
          type="text"
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          placeholder="00000-000"
          maxLength={9}
          required
          style={{
            flex: 1, padding: "8px 12px",
            border: "1px solid var(--border-color, #e1e3e5)",
            borderRadius: 6, fontSize: 13,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px", borderRadius: 6,
            border: "1px solid var(--primary-color, #1e2d7d)",
            background: "#fff", color: "var(--primary-color, #1e2d7d)",
            fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "..." : "Calcular"}
        </button>
      </form>

      {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{error}</p>}

      {estimates && (
        <div>
          <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>
            Entrega para {estimates[0].city}, {estimates[0].state}:
          </p>
          {estimates.map((est) => (
            <div key={est.method} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 10px", borderRadius: 6, marginBottom: 4,
              background: est.price === "Grátis" ? "#f0fdf4" : "#f9fafb",
              border: est.price === "Grátis" ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{est.method}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{est.days}</div>
              </div>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: est.price === "Grátis" ? "#16a34a" : "#202223",
              }}>
                {est.price}
              </span>
            </div>
          ))}
          <a
            href="https://www.correios.com.br"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: "#6b7280", textDecoration: "underline" }}
          >
            Não sei meu CEP
          </a>
        </div>
      )}
    </div>
  );
}
