"use client";

import { useState } from "react";
import { fetchAddressByCep, formatCep } from "@/lib/viacep";

export default function ShippingEstimationBox() {
  const [cep, setCep] = useState("");
  const [result, setResult] = useState<{ city: string; state: string; free: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const FREE_THRESHOLD = 29900; // R$ 299

  const handleCheck = async () => {
    setLoading(true);
    const data = await fetchAddressByCep(cep.replace(/\D/g, ""));
    if (data) {
      setResult({ city: data.localidade, state: data.uf, free: true });
    }
    setLoading(false);
  };

  return (
    <div style={{
      border: "2px solid #16a34a",
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: result ? 10 : 0 }}>
        <span style={{ fontSize: 24 }}>📦</span>
        <div style={{ flex: 1 }}>
          {result ? (
            <>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Envio para {result.city}, {result.state}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#16a34a" }}>
                Frete Grátis
              </div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>
                Prazo: 3 a 7 dias úteis após confirmação
              </div>
            </>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(formatCep(e.target.value))}
                placeholder="Digite seu CEP"
                maxLength={9}
                style={{
                  flex: 1, padding: "8px 12px",
                  border: "1px solid #d1d5db", borderRadius: 6,
                  fontSize: 13,
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              />
              <button
                onClick={handleCheck}
                disabled={loading || cep.replace(/\D/g, "").length < 8}
                style={{
                  padding: "8px 14px", borderRadius: 6,
                  background: "#16a34a", color: "#fff",
                  border: "none", fontWeight: 600, fontSize: 13,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {loading ? "..." : "Calcular"}
              </button>
            </div>
          )}
        </div>
        {result && (
          <button onClick={() => setResult(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 12 }}>
            Alterar
          </button>
        )}
      </div>
    </div>
  );
}
