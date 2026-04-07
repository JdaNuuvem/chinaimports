"use client";

import type { ThemeConfig } from "@/lib/theme-config";
import { Section, FontPicker, SelectField, CheckboxField, SaveButton } from "./shared";

interface TypographyTabProps {
  config: ThemeConfig;
  saving: boolean;
  onSave: (updates: Partial<ThemeConfig>) => Promise<void>;
  updateField: <K extends keyof ThemeConfig>(section: K, field: string, value: unknown) => void;
}

export default function TypographyTab({ config, saving, onSave, updateField }: TypographyTabProps) {
  return (
    <Section title="Tipografia" description="Escolha as fontes e tamanhos de texto da sua loja. A mudan\ça \é aplicada em todas as p\áginas.">
      {/* Preview */}
      <div style={{ background: "#f9fafb", border: "1px solid #e1e3e5", borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <p style={{ fontFamily: config.typography.headingFontFamily, fontWeight: config.typography.headingFontWeight, fontSize: 22, marginBottom: 4, color: "#202223" }}>
          T\ítulo de exemplo
        </p>
        <p style={{ fontFamily: config.typography.bodyFontFamily, fontWeight: config.typography.bodyFontWeight, fontSize: config.typography.baseFontSize, color: "#6d7175", lineHeight: 1.6 }}>
          Este \é um texto de exemplo com a fonte do corpo selecionada. Veja como fica o par\ágrafo com o tamanho base configurado.
          {config.typography.underlineLinks && <> Veja um <span style={{ textDecoration: "underline", color: "#005bd3" }}>link de exemplo</span>.</>}
        </p>
      </div>

      <FontPicker label="Fonte dos t\ítulos" value={config.typography.headingFontFamily} onChange={(v) => updateField("typography", "headingFontFamily", v)} />
      <FontPicker label="Fonte do corpo" value={config.typography.bodyFontFamily} onChange={(v) => updateField("typography", "bodyFontFamily", v)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#202223" }}>Tamanho base</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="range" min={12} max={20} value={config.typography.baseFontSize} onChange={(e) => updateField("typography", "baseFontSize", Number(e.target.value))} style={{ flex: 1 }} />
            <span style={{ fontSize: 14, fontWeight: 600, minWidth: 40, textAlign: "center", color: "#202223" }}>{config.typography.baseFontSize}px</span>
          </div>
        </div>
        <SelectField label="Peso dos t\ítulos" value={String(config.typography.headingFontWeight)} options={[
          { value: "300", label: "Light (300)" },
          { value: "400", label: "Normal (400)" },
          { value: "500", label: "Medium (500)" },
          { value: "600", label: "Semi-bold (600)" },
          { value: "700", label: "Bold (700)" },
          { value: "800", label: "Extra-bold (800)" },
          { value: "900", label: "Black (900)" },
        ]} onChange={(v) => updateField("typography", "headingFontWeight", Number(v))} />
      </div>

      <CheckboxField label="Sublinhar links em textos" checked={config.typography.underlineLinks} onChange={(v) => updateField("typography", "underlineLinks", v)} />
      <SaveButton saving={saving} onClick={() => onSave({ typography: config.typography })} />
    </Section>
  );
}
