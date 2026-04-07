"use client";

import { useLocale, SUPPORTED_LOCALES, SUPPORTED_CURRENCIES } from "@/context/LocaleContext";

export default function LocaleSwitcher() {
  const { locale, setLocale, currency, setCurrency } = useLocale();

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {/* Language */}
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        aria-label="Idioma"
        style={{
          padding: "4px 8px",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 4,
          background: "rgba(255,255,255,0.1)",
          color: "inherit",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        {SUPPORTED_LOCALES.map((l) => (
          <option key={l.id} value={l.id} style={{ color: "#333" }}>
            {l.flag} {l.label}
          </option>
        ))}
      </select>

      {/* Currency */}
      <select
        value={currency.code}
        onChange={(e) => setCurrency(e.target.value)}
        aria-label="Moeda"
        style={{
          padding: "4px 8px",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 4,
          background: "rgba(255,255,255,0.1)",
          color: "inherit",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        {SUPPORTED_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code} style={{ color: "#333" }}>
            {c.symbol} {c.code}
          </option>
        ))}
      </select>
    </div>
  );
}
