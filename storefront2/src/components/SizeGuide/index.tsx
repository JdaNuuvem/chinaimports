"use client";
import { useState } from "react";

export default function SizeGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ background: "none", border: "none", color: "var(--link-color)", cursor: "pointer", fontSize: 13, textDecoration: "underline", padding: 0 }}
      >
        Guia de tamanhos
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setOpen(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", background: "#fff", borderRadius: 12, padding: 30, maxWidth: 600, width: "90%", maxHeight: "80vh", overflow: "auto" }}>
            <button onClick={() => setOpen(false)} style={{ position: "absolute", top: 12, right: 16, background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>×</button>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Guia de Tamanhos</h2>

            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Camisetas e Regatas</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24, fontSize: 13 }}>
              <thead><tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                <th style={{ padding: 8, textAlign: "left" }}>Tamanho</th>
                <th style={{ padding: 8 }}>Tórax (cm)</th>
                <th style={{ padding: 8 }}>Cintura (cm)</th>
                <th style={{ padding: 8 }}>Quadril (cm)</th>
              </tr></thead>
              <tbody>
                {[["PP", "84-89", "69-74", "84-89"], ["P", "89-94", "74-79", "89-94"], ["M", "97-102", "81-86", "97-102"], ["G", "107-112", "89-94", "107-112"], ["GG", "117-122", "97-102", "117-122"]].map(([size, chest, waist, hip]) => (
                  <tr key={size} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: 8, fontWeight: 600 }}>{size}</td>
                    <td style={{ padding: 8, textAlign: "center" }}>{chest}</td>
                    <td style={{ padding: 8, textAlign: "center" }}>{waist}</td>
                    <td style={{ padding: 8, textAlign: "center" }}>{hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Calçados</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                <th style={{ padding: 8, textAlign: "left" }}>BR</th>
                <th style={{ padding: 8 }}>US</th>
                <th style={{ padding: 8 }}>EUR</th>
                <th style={{ padding: 8 }}>Comprimento (cm)</th>
              </tr></thead>
              <tbody>
                {[["38", "6.5", "39", "25"], ["39", "7.5", "40", "25.5"], ["40", "8", "41", "26"], ["41", "9", "42", "27"], ["42", "9.5", "43", "27.5"], ["43", "10.5", "44", "28"], ["44", "11", "45", "29"]].map(([br, us, eur, cm]) => (
                  <tr key={br} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: 8, fontWeight: 600 }}>{br}</td>
                    <td style={{ padding: 8, textAlign: "center" }}>{us}</td>
                    <td style={{ padding: 8, textAlign: "center" }}>{eur}</td>
                    <td style={{ padding: 8, textAlign: "center" }}>{cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p style={{ marginTop: 16, fontSize: 12, color: "#888" }}>
              Medidas podem variar. Em caso de dúvida, opte pelo tamanho maior.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
