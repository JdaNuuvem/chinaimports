"use client";

import { useState } from "react";
import type { ThemeConfig } from "@/lib/theme-config";
import { Section, ColorField, SaveButton } from "./shared";

interface ColorsTabProps {
  config: ThemeConfig;
  saving: boolean;
  onSave: (updates: Partial<ThemeConfig>) => Promise<void>;
  updateField: <K extends keyof ThemeConfig>(section: K, field: string, value: unknown) => void;
}

// Apply a preset by updating multiple color fields at once
function applyPreset(
  updateField: ColorsTabProps["updateField"],
  preset: Partial<ThemeConfig["colors"]>
) {
  Object.entries(preset).forEach(([k, v]) => updateField("colors", k, v));
}

const PRESETS: { name: string; colors: Partial<ThemeConfig["colors"]> }[] = [
  {
    name: "Azul Clássico",
    colors: {
      accentColor: "#1e2d7d", primaryButtonBg: "#1e2d7d", primaryButtonText: "#ffffff",
      headerBg: "#ffffff", headerText: "#202223", headerAccent: "#1e2d7d",
      footerBg: "#1e2d7d", footerHeadingText: "#ffffff", footerBodyText: "#d4d4d4",
    },
  },
  {
    name: "Verde Natureza",
    colors: {
      accentColor: "#008060", primaryButtonBg: "#008060", primaryButtonText: "#ffffff",
      headerBg: "#ffffff", headerText: "#202223", headerAccent: "#008060",
      footerBg: "#004c3f", footerHeadingText: "#ffffff", footerBodyText: "#c8e8dd",
    },
  },
  {
    name: "Preto Minimalista",
    colors: {
      accentColor: "#000000", primaryButtonBg: "#000000", primaryButtonText: "#ffffff",
      headerBg: "#ffffff", headerText: "#000000", headerAccent: "#000000",
      footerBg: "#000000", footerHeadingText: "#ffffff", footerBodyText: "#9ca3af",
    },
  },
  {
    name: "Vermelho Oferta",
    colors: {
      accentColor: "#e11d48", primaryButtonBg: "#e11d48", primaryButtonText: "#ffffff",
      headerBg: "#ffffff", headerText: "#202223", headerAccent: "#e11d48",
      footerBg: "#1f1f1f", footerHeadingText: "#ffffff", footerBodyText: "#d4d4d4",
    },
  },
  {
    name: "Roxo Luxo",
    colors: {
      accentColor: "#6d28d9", primaryButtonBg: "#6d28d9", primaryButtonText: "#ffffff",
      headerBg: "#ffffff", headerText: "#202223", headerAccent: "#6d28d9",
      footerBg: "#2e1065", footerHeadingText: "#ffffff", footerBodyText: "#ddd6fe",
    },
  },
  {
    name: "Laranja Vibrante",
    colors: {
      accentColor: "#ea580c", primaryButtonBg: "#ea580c", primaryButtonText: "#ffffff",
      headerBg: "#ffffff", headerText: "#202223", headerAccent: "#ea580c",
      footerBg: "#7c2d12", footerHeadingText: "#ffffff", footerBodyText: "#fed7aa",
    },
  },
  {
    name: "Amarelo Solar",
    colors: {
      accentColor: "#f59e0b", primaryButtonBg: "#f59e0b", primaryButtonText: "#1f1f1f",
      headerBg: "#ffffff", headerText: "#1f1f1f", headerAccent: "#f59e0b",
      footerBg: "#1f1f1f", footerHeadingText: "#f59e0b", footerBodyText: "#d4d4d4",
    },
  },
  {
    name: "Branco Clean",
    colors: {
      accentColor: "#1f1f1f", primaryButtonBg: "#1f1f1f", primaryButtonText: "#ffffff",
      headerBg: "#ffffff", headerText: "#1f1f1f", headerAccent: "#1f1f1f",
      footerBg: "#f6f6f7", footerHeadingText: "#1f1f1f", footerBodyText: "#6d7175",
    },
  },
  {
    name: "Rosa Moderno",
    colors: {
      accentColor: "#ec4899", primaryButtonBg: "#ec4899", primaryButtonText: "#ffffff",
      headerBg: "#ffffff", headerText: "#202223", headerAccent: "#ec4899",
      footerBg: "#831843", footerHeadingText: "#ffffff", footerBodyText: "#fbcfe8",
    },
  },
  {
    name: "Ciano Tech",
    colors: {
      accentColor: "#0891b2", primaryButtonBg: "#0891b2", primaryButtonText: "#ffffff",
      headerBg: "#ffffff", headerText: "#202223", headerAccent: "#0891b2",
      footerBg: "#083344", footerHeadingText: "#ffffff", footerBodyText: "#a5f3fc",
    },
  },
  {
    name: "Dourado Premium",
    colors: {
      accentColor: "#b45309", primaryButtonBg: "#b45309", primaryButtonText: "#ffffff",
      headerBg: "#1f1f1f", headerText: "#fbbf24", headerAccent: "#fbbf24",
      footerBg: "#0a0a0a", footerHeadingText: "#fbbf24", footerBodyText: "#d4d4d4",
    },
  },
  {
    name: "Escuro Dark",
    colors: {
      accentColor: "#3b82f6", primaryButtonBg: "#3b82f6", primaryButtonText: "#ffffff",
      headerBg: "#0f172a", headerText: "#f1f5f9", headerAccent: "#3b82f6",
      footerBg: "#020617", footerHeadingText: "#f1f5f9", footerBodyText: "#94a3b8",
      backgroundColor: "#0f172a", textColor: "#cbd5e1", headingColor: "#f1f5f9",
    },
  },
];

export default function ColorsTab({ config, saving, onSave, updateField }: ColorsTabProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const c = config.colors;

  return (
    <Section title="Cores">
      <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
        Escolha um tema pronto ou ajuste as cores principais. O resto é opcional.
      </p>

      {/* Presets */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#6d7175", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
          Temas prontos
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(updateField, p.colors)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid #c9cccf",
                background: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: p.colors.accentColor,
                  border: "1px solid #00000020",
                }}
              />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
        <div
          style={{
            background: c.headerBg,
            color: c.headerText,
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14 }}>PREVIEW DA LOJA</span>
          <span style={{ color: c.headerAccent, fontSize: 12 }}>Link de destaque</span>
        </div>
        <div style={{ background: c.backgroundColor, padding: 16 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <button
              style={{
                padding: "8px 16px",
                background: c.primaryButtonBg,
                color: c.primaryButtonText,
                border: "none",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Comprar agora
            </button>
            <button
              style={{
                padding: "8px 16px",
                background: c.secondaryButtonBg,
                color: c.secondaryButtonText,
                border: "none",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Ver mais
            </button>
          </div>
          <p style={{ color: c.headingColor, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Título do produto</p>
          <p style={{ color: c.textColor, fontSize: 12, marginBottom: 4 }}>Descrição do produto em texto normal</p>
          <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
            <span style={{ color: c.onSaleAccent, fontWeight: 700 }}>R$ 199,00</span>
            <span style={{ textDecoration: "line-through", color: "#999" }}>R$ 249,00</span>
          </div>
        </div>
        <div style={{ background: c.footerBg, padding: "10px 20px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: c.footerHeadingText, fontWeight: 600, fontSize: 12 }}>Rodapé</span>
          <span style={{ color: c.footerBodyText, fontSize: 11 }}>Texto do rodapé</span>
        </div>
      </div>

      {/* Essential colors */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <ColorField
          label="Cor principal (botão comprar)"
          value={c.primaryButtonBg}
          onChange={(v) => {
            updateField("colors", "primaryButtonBg", v);
            updateField("colors", "accentColor", v);
          }}
        />
        <ColorField
          label="Fundo do cabeçalho"
          value={c.headerBg}
          onChange={(v) => updateField("colors", "headerBg", v)}
        />
        <ColorField
          label="Texto do cabeçalho"
          value={c.headerText}
          onChange={(v) => updateField("colors", "headerText", v)}
        />
        <ColorField
          label="Fundo do rodapé"
          value={c.footerBg}
          onChange={(v) => updateField("colors", "footerBg", v)}
        />
        <ColorField
          label="Fundo da página"
          value={c.backgroundColor}
          onChange={(v) => updateField("colors", "backgroundColor", v)}
        />
        <ColorField
          label="Preço em promoção"
          value={c.onSaleAccent}
          onChange={(v) => updateField("colors", "onSaleAccent", v)}
        />
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced((v) => !v)}
        style={{
          background: "none",
          border: "none",
          color: "#008060",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          padding: "8px 0",
          marginBottom: showAdvanced ? 16 : 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {showAdvanced ? "▼" : "▶"} Cores avançadas ({showAdvanced ? "ocultar" : "mostrar todas"})
      </button>

      {showAdvanced && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
            padding: 16,
            background: "#f9fafb",
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <ColorField label="Títulos" value={c.headingColor} onChange={(v) => updateField("colors", "headingColor", v)} />
          <ColorField label="Texto" value={c.textColor} onChange={(v) => updateField("colors", "textColor", v)} />
          <ColorField label="Texto forte" value={c.textStrongColor} onChange={(v) => updateField("colors", "textStrongColor", v)} />
          <ColorField label="Links" value={c.linkColor} onChange={(v) => updateField("colors", "linkColor", v)} />
          <ColorField label="Bordas" value={c.borderColor} onChange={(v) => updateField("colors", "borderColor", v)} />
          <ColorField label="Fundo secundário" value={c.secondaryBackground} onChange={(v) => updateField("colors", "secondaryBackground", v)} />
          <ColorField label="Texto botão primário" value={c.primaryButtonText} onChange={(v) => updateField("colors", "primaryButtonText", v)} />
          <ColorField label="Fundo botão secundário" value={c.secondaryButtonBg} onChange={(v) => updateField("colors", "secondaryButtonBg", v)} />
          <ColorField label="Texto botão secundário" value={c.secondaryButtonText} onChange={(v) => updateField("colors", "secondaryButtonText", v)} />
          <ColorField label="Destaque cabeçalho" value={c.headerAccent} onChange={(v) => updateField("colors", "headerAccent", v)} />
          <ColorField label="Texto claro cabeçalho" value={c.headerLightText} onChange={(v) => updateField("colors", "headerLightText", v)} />
          <ColorField label="Títulos do rodapé" value={c.footerHeadingText} onChange={(v) => updateField("colors", "footerHeadingText", v)} />
          <ColorField label="Texto do rodapé" value={c.footerBodyText} onChange={(v) => updateField("colors", "footerBodyText", v)} />
          <ColorField label="Destaque rodapé" value={c.footerAccent} onChange={(v) => updateField("colors", "footerAccent", v)} />
          <ColorField label="Em estoque" value={c.inStockColor} onChange={(v) => updateField("colors", "inStockColor", v)} />
          <ColorField label="Estoque baixo" value={c.lowStockColor} onChange={(v) => updateField("colors", "lowStockColor", v)} />
          <ColorField label="Esgotado" value={c.soldOutColor} onChange={(v) => updateField("colors", "soldOutColor", v)} />
          <ColorField label="Etiqueta 1" value={c.customLabel1Bg} onChange={(v) => updateField("colors", "customLabel1Bg", v)} />
          <ColorField label="Etiqueta 2" value={c.customLabel2Bg} onChange={(v) => updateField("colors", "customLabel2Bg", v)} />
          <ColorField label="Estrelas avaliação" value={c.starColor} onChange={(v) => updateField("colors", "starColor", v)} />
          <ColorField label="Mensagem de erro" value={c.errorColor} onChange={(v) => updateField("colors", "errorColor", v)} />
          <ColorField label="Mensagem de sucesso" value={c.successColor} onChange={(v) => updateField("colors", "successColor", v)} />
          <ColorField label="Fundo barra anúncio" value={c.announcementBarBg} onChange={(v) => updateField("colors", "announcementBarBg", v)} />
          <ColorField label="Texto barra anúncio" value={c.announcementBarText} onChange={(v) => updateField("colors", "announcementBarText", v)} />
          <ColorField label="Fundo menu" value={c.menuBarBg} onChange={(v) => updateField("colors", "menuBarBg", v)} />
          <ColorField label="Texto menu" value={c.menuBarText} onChange={(v) => updateField("colors", "menuBarText", v)} />
        </div>
      )}

      <SaveButton saving={saving} onClick={() => onSave({ colors: config.colors })} />
    </Section>
  );
}
