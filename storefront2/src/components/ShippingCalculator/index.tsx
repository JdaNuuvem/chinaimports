"use client";
import { useState } from "react";
import { formatMoney } from "@/lib/utils";

interface ShippingOption {
  name: string;
  price: number;
  days: string;
}

export default function ShippingCalculator() {
  const [cep, setCep] = useState("");
  const [options, setOptions] = useState<ShippingOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setError("CEP inválido. Digite 8 números.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      const res = await fetch(`${backendUrl}/store/shipping-options/estimate?cep=${cleanCep}`);
      if (res.ok) {
        const data = await res.json();
        if (data.shipping_options?.length > 0) {
          setOptions(data.shipping_options.map((opt: { name: string; amount: number; minDays?: number; maxDays?: number }) => ({
            name: opt.name,
            price: opt.amount,
            days: opt.minDays && opt.maxDays ? `${opt.minDays}-${opt.maxDays} dias úteis` : "5-10 dias úteis",
          })));
        } else {
          // Fallback: estimate based on CEP region
          const region = parseInt(cleanCep.slice(0, 1));
          const basePrice = region <= 2 ? 0 : region <= 5 ? 1990 : 2990;
          setOptions([
            { name: "Frete Grátis", price: 0, days: "8-12 dias úteis" },
            ...(basePrice > 0 ? [{ name: "Frete Padrão", price: basePrice, days: "5-8 dias úteis" }] : []),
            { name: "Frete Expresso", price: basePrice + 2500, days: "2-3 dias úteis" },
          ]);
        }
      } else {
        throw new Error("API error");
      }
    } catch {
      // Fallback: estimate based on CEP region
      const region = parseInt(cleanCep.slice(0, 1));
      const basePrice = region <= 2 ? 0 : region <= 5 ? 1990 : 2990;
      setOptions([
        { name: "Frete Grátis", price: 0, days: "8-12 dias úteis" },
        ...(basePrice > 0 ? [{ name: "Frete Padrão", price: basePrice, days: "5-8 dias úteis" }] : []),
        { name: "Frete Expresso", price: basePrice + 2500, days: "2-3 dias úteis" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return digits;
  };

  return (
    <div style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: 16 }}>
      <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Calcular frete</p>
      <form onSubmit={handleCalculate} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          placeholder="00000-000"
          maxLength={9}
          style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: 4, fontSize: 14 }}
        />
        <button type="submit" disabled={loading} className="button button--secondary" style={{ padding: "8px 16px", fontSize: 13 }}>
          {loading ? "..." : "Calcular"}
        </button>
      </form>

      {error && <p style={{ color: "var(--error-color)", fontSize: 13, marginTop: 8 }}>{error}</p>}

      {options && (
        <div style={{ marginTop: 12 }}>
          {options.map((opt, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < options.length - 1 ? "1px solid var(--border-color)" : "none", fontSize: 13 }}>
              <div>
                <span style={{ fontWeight: 600 }}>{opt.name}</span>
                <span style={{ color: "#888", marginLeft: 8 }}>{opt.days}</span>
              </div>
              <span style={{ fontWeight: 700, color: opt.price === 0 ? "var(--success-color)" : "inherit" }}>
                {opt.price === 0 ? "Grátis" : formatMoney(opt.price)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
