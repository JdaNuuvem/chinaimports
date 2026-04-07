"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/utils";

interface InstallmentCalculatorProps {
  price: number; // centavos
  maxInstallments?: number;
  interestFreeInstallments?: number;
  interestRate?: number; // e.g. 1.99 for 1.99%
}

export default function InstallmentCalculator({
  price,
  maxInstallments = 12,
  interestFreeInstallments = 10,
  interestRate = 1.99,
}: InstallmentCalculatorProps) {
  const [open, setOpen] = useState(false);

  const installments = Array.from({ length: maxInstallments }, (_, i) => {
    const n = i + 1;
    if (n === 1) return { n, value: price, total: price, interest: false };
    if (n <= interestFreeInstallments) {
      return { n, value: Math.ceil(price / n), total: price, interest: false };
    }
    // With interest
    const monthlyRate = interestRate / 100;
    const totalWithInterest = Math.ceil(price * Math.pow(1 + monthlyRate, n));
    return { n, value: Math.ceil(totalWithInterest / n), total: totalWithInterest, interest: true };
  });

  const bestInstallment = installments[interestFreeInstallments - 1];

  return (
    <div>
      {/* Quick display */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 13, color: "var(--primary-color, #1e2d7d)",
          padding: 0, textDecoration: "underline", fontWeight: 500,
        }}
      >
        ou {bestInstallment.n}x de {formatMoney(bestInstallment.value)} sem juros
      </button>

      {/* Full table modal */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            zIndex: 9999, background: "#fff", borderRadius: 16,
            width: 380, maxWidth: "90vw", maxHeight: "80vh",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Opções de Parcelamento</h3>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af" }}>✕</button>
            </div>

            <div style={{ padding: "12px 20px", overflowY: "auto", maxHeight: "calc(80vh - 60px)" }}>
              {installments.map((inst) => (
                <div
                  key={inst.n}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      {inst.n}x de {formatMoney(inst.value)}
                    </span>
                    {!inst.interest && inst.n > 1 && (
                      <span style={{
                        marginLeft: 8, fontSize: 10, fontWeight: 700,
                        color: "#16a34a", background: "#f0fdf4",
                        padding: "2px 6px", borderRadius: 4,
                      }}>
                        sem juros
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: inst.interest ? "#dc2626" : "#6b7280" }}>
                    {inst.interest
                      ? `Total: ${formatMoney(inst.total)}`
                      : `Total: ${formatMoney(inst.total)}`}
                  </span>
                </div>
              ))}

              <div style={{ marginTop: 16, padding: "12px", background: "#f9fafb", borderRadius: 8, fontSize: 11, color: "#6b7280", textAlign: "center" }}>
                💳 Aceitamos Visa, Mastercard, Elo e Amex
                <br />
                🏦 Também aceitamos PIX e boleto bancário
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
