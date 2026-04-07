"use client";

import { useState } from "react";

interface SizeChartProps {
  category?: "camiseta" | "calca" | "tenis";
}

const CHARTS = {
  camiseta: {
    headers: ["Tamanho", "Busto (cm)", "Comprimento (cm)", "Manga (cm)"],
    rows: [
      ["PP", "88-92", "68", "18"],
      ["P", "92-96", "70", "19"],
      ["M", "96-100", "72", "20"],
      ["G", "100-106", "74", "21"],
      ["GG", "106-112", "76", "22"],
      ["XG", "112-118", "78", "23"],
    ],
  },
  calca: {
    headers: ["Tamanho", "Cintura (cm)", "Quadril (cm)", "Comprimento (cm)"],
    rows: [
      ["36", "72-76", "94-98", "100"],
      ["38", "76-80", "98-102", "102"],
      ["40", "80-84", "102-106", "104"],
      ["42", "84-88", "106-110", "106"],
      ["44", "88-92", "110-114", "108"],
      ["46", "92-96", "114-118", "110"],
    ],
  },
  tenis: {
    headers: ["BR", "US", "EUR", "Comprimento (cm)"],
    rows: [
      ["36", "5", "37", "23.5"],
      ["37", "5.5", "38", "24"],
      ["38", "6", "39", "24.5"],
      ["39", "7", "40", "25.5"],
      ["40", "8", "41", "26"],
      ["41", "9", "42", "27"],
      ["42", "10", "43", "27.5"],
      ["43", "11", "44", "28.5"],
      ["44", "12", "45", "29"],
    ],
  },
};

export default function SizeChart({ category = "camiseta" }: SizeChartProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof CHARTS>(category);
  const chart = CHARTS[activeCategory];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 12, color: "var(--primary-color, #1e2d7d)",
          textDecoration: "underline", padding: 0, fontWeight: 500,
        }}
      >
        📏 Guia de tamanhos
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            zIndex: 9999, background: "#fff", borderRadius: 16,
            width: 520, maxWidth: "95vw", maxHeight: "80vh",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>📏 Guia de Tamanhos</h3>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af" }}>✕</button>
            </div>

            <div style={{ padding: "16px 20px" }}>
              {/* Category tabs */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {(Object.keys(CHARTS) as Array<keyof typeof CHARTS>).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                      border: `1px solid ${activeCategory === cat ? "var(--primary-color, #1e2d7d)" : "#e5e7eb"}`,
                      background: activeCategory === cat ? "var(--primary-color, #1e2d7d)" : "#fff",
                      color: activeCategory === cat ? "#fff" : "#374151",
                      cursor: "pointer", textTransform: "capitalize",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {chart.headers.map((h) => (
                        <th key={h} style={{ padding: "10px 12px", background: "#f9fafb", borderBottom: "2px solid #e5e7eb", textAlign: "left", fontWeight: 700, fontSize: 12, color: "#374151" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chart.rows.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                        {row.map((cell, j) => (
                          <td key={j} style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontWeight: j === 0 ? 700 : 400 }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 12, textAlign: "center" }}>
                Em caso de dúvida entre dois tamanhos, recomendamos escolher o maior.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
