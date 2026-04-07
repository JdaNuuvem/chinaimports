"use client";

import type { ThemeConfig } from "@/lib/theme-config";
import { Section, ColorField, ColorGroup, SaveButton } from "./shared";

interface ColorsTabProps {
  config: ThemeConfig;
  saving: boolean;
  onSave: (updates: Partial<ThemeConfig>) => Promise<void>;
  updateField: <K extends keyof ThemeConfig>(section: K, field: string, value: unknown) => void;
}

export default function ColorsTab({ config, saving, onSave, updateField }: ColorsTabProps) {
  return (
    <Section title="Cores">
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        Personalize todas as cores da loja. As mudan\ças s\ão aplicadas em tempo real ap\ós salvar.
      </p>

      {/* Preview */}
      <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ background: config.colors.headerBg, color: config.colors.headerText, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>PREVIEW DA LOJA</span>
          <span style={{ color: config.colors.headerAccent, fontSize: 12 }}>Link de destaque</span>
        </div>
        <div style={{ background: config.colors.backgroundColor, padding: 16 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <button style={{ padding: "8px 16px", background: config.colors.primaryButtonBg, color: config.colors.primaryButtonText, border: "none", borderRadius: 4, fontWeight: 600, fontSize: 12 }}>Bot\ão Prim\ário</button>
            <button style={{ padding: "8px 16px", background: config.colors.secondaryButtonBg, color: config.colors.secondaryButtonText, border: "none", borderRadius: 4, fontWeight: 600, fontSize: 12 }}>Bot\ão Secund\ário</button>
          </div>
          <p style={{ color: config.colors.headingColor, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>T\ítulo do produto</p>
          <p style={{ color: config.colors.textColor, fontSize: 12, marginBottom: 4 }}>Descri\ç\ão do produto em texto normal</p>
          <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
            <span style={{ color: config.colors.onSaleAccent, fontWeight: 700 }}>R$ 199,00</span>
            <span style={{ textDecoration: "line-through", color: "#999" }}>R$ 249,00</span>
            <span style={{ color: config.colors.inStockColor }}>Em estoque</span>
          </div>
        </div>
        <div style={{ background: config.colors.footerBg, padding: "10px 20px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: config.colors.footerHeadingText, fontWeight: 600, fontSize: 12 }}>Footer</span>
          <span style={{ color: config.colors.footerBodyText, fontSize: 11 }}>Texto do rodap\é</span>
        </div>
      </div>

      {/* Geral */}
      <ColorGroup title="Geral" description="Cores base usadas em toda a loja">
        <ColorField label="Cor dos t\ítulos" value={config.colors.headingColor} onChange={(v) => updateField("colors", "headingColor", v)} />
        <ColorField label="Cor do texto" value={config.colors.textColor} onChange={(v) => updateField("colors", "textColor", v)} />
        <ColorField label="Cor do texto forte" value={config.colors.textStrongColor} onChange={(v) => updateField("colors", "textStrongColor", v)} />
        <ColorField label="Cor de destaque (accent)" value={config.colors.accentColor} onChange={(v) => updateField("colors", "accentColor", v)} />
        <ColorField label="Cor dos links" value={config.colors.linkColor} onChange={(v) => updateField("colors", "linkColor", v)} />
        <ColorField label="Cor das bordas" value={config.colors.borderColor} onChange={(v) => updateField("colors", "borderColor", v)} />
        <ColorField label="Fundo principal" value={config.colors.backgroundColor} onChange={(v) => updateField("colors", "backgroundColor", v)} />
        <ColorField label="Fundo secund\ário" value={config.colors.secondaryBackground} onChange={(v) => updateField("colors", "secondaryBackground", v)} />
      </ColorGroup>

      {/* Bot\ões */}
      <ColorGroup title="Bot\ões" description="Bot\ão de compra e bot\ão secund\ário">
        <ColorField label="Fundo do bot\ão prim\ário" value={config.colors.primaryButtonBg} onChange={(v) => updateField("colors", "primaryButtonBg", v)} />
        <ColorField label="Texto do bot\ão prim\ário" value={config.colors.primaryButtonText} onChange={(v) => updateField("colors", "primaryButtonText", v)} />
        <ColorField label="Fundo do bot\ão secund\ário" value={config.colors.secondaryButtonBg} onChange={(v) => updateField("colors", "secondaryButtonBg", v)} />
        <ColorField label="Texto do bot\ão secund\ário" value={config.colors.secondaryButtonText} onChange={(v) => updateField("colors", "secondaryButtonText", v)} />
      </ColorGroup>

      {/* Header */}
      <ColorGroup title="Cabe\çalho (Header)" description="Barra de navega\ç\ão principal no topo">
        <ColorField label="Fundo do cabe\çalho" value={config.colors.headerBg} onChange={(v) => updateField("colors", "headerBg", v)} />
        <ColorField label="Texto do cabe\çalho" value={config.colors.headerText} onChange={(v) => updateField("colors", "headerText", v)} />
        <ColorField label="Texto claro do cabe\çalho" value={config.colors.headerLightText} onChange={(v) => updateField("colors", "headerLightText", v)} />
        <ColorField label="Destaque do cabe\çalho" value={config.colors.headerAccent} onChange={(v) => updateField("colors", "headerAccent", v)} />
      </ColorGroup>

      {/* Footer */}
      <ColorGroup title="Rodap\é (Footer)" description="\Área de links e informa\ç\ões no final da p\ágina">
        <ColorField label="Fundo do rodap\é" value={config.colors.footerBg} onChange={(v) => updateField("colors", "footerBg", v)} />
        <ColorField label="T\ítulos do rodap\é" value={config.colors.footerHeadingText} onChange={(v) => updateField("colors", "footerHeadingText", v)} />
        <ColorField label="Texto do rodap\é" value={config.colors.footerBodyText} onChange={(v) => updateField("colors", "footerBodyText", v)} />
        <ColorField label="Destaque do rodap\é" value={config.colors.footerAccent} onChange={(v) => updateField("colors", "footerAccent", v)} />
      </ColorGroup>

      {/* Produto */}
      <ColorGroup title="Produto" description="Pre\ços, estoque e etiquetas nos cards de produto">
        <ColorField label="Pre\ço em promo\ç\ão" value={config.colors.onSaleAccent} onChange={(v) => updateField("colors", "onSaleAccent", v)} />
        <ColorField label="Em estoque" value={config.colors.inStockColor} onChange={(v) => updateField("colors", "inStockColor", v)} />
        <ColorField label="Estoque baixo" value={config.colors.lowStockColor} onChange={(v) => updateField("colors", "lowStockColor", v)} />
        <ColorField label="Esgotado" value={config.colors.soldOutColor} onChange={(v) => updateField("colors", "soldOutColor", v)} />
        <ColorField label="Etiqueta personalizada 1" value={config.colors.customLabel1Bg} onChange={(v) => updateField("colors", "customLabel1Bg", v)} />
        <ColorField label="Etiqueta personalizada 2" value={config.colors.customLabel2Bg} onChange={(v) => updateField("colors", "customLabel2Bg", v)} />
        <ColorField label="Estrelas de avalia\ç\ão" value={config.colors.starColor} onChange={(v) => updateField("colors", "starColor", v)} />
      </ColorGroup>

      {/* Feedback */}
      <ColorGroup title="Mensagens" description="Cores de erro e sucesso em formul\ários e alertas">
        <ColorField label="Mensagem de erro" value={config.colors.errorColor} onChange={(v) => updateField("colors", "errorColor", v)} />
        <ColorField label="Mensagem de sucesso" value={config.colors.successColor} onChange={(v) => updateField("colors", "successColor", v)} />
      </ColorGroup>

      {/* Barra */}
      <ColorGroup title="Barras e Menu" description="Barra de an\úncio e menu de navega\ç\ão">
        <ColorField label="Fundo da barra de an\úncio" value={config.colors.announcementBarBg} onChange={(v) => updateField("colors", "announcementBarBg", v)} />
        <ColorField label="Texto da barra de an\úncio" value={config.colors.announcementBarText} onChange={(v) => updateField("colors", "announcementBarText", v)} />
        <ColorField label="Fundo do menu" value={config.colors.menuBarBg} onChange={(v) => updateField("colors", "menuBarBg", v)} />
        <ColorField label="Texto do menu" value={config.colors.menuBarText} onChange={(v) => updateField("colors", "menuBarText", v)} />
      </ColorGroup>

      <SaveButton saving={saving} onClick={() => onSave({ colors: config.colors })} />
    </Section>
  );
}
