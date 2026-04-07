"use client";

import React from "react";
import type { ThemeConfig } from "@/lib/theme-config";
import ImageUpload from "@/components/ImageUpload";

interface Props {
  sectionId: string;
  config: ThemeConfig;
  onSave: (updates: Partial<ThemeConfig>) => Promise<void>;
  onClose: () => void;
  token: string;
  saving: boolean;
}

function Field({ label, value, onChange, helpText, multiline }: { label: string; value: string; onChange: (v: string) => void; helpText?: string; multiline?: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#202223" }}>{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} style={{ width: "100%", padding: "8px 10px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
      )}
      {helpText && <p style={{ fontSize: 11, color: "#8c9196", marginTop: 2 }}>{helpText}</p>}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [local, setLocal] = React.useState(value);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => { setLocal(value); }, [value]);
  const update = (v: string) => {
    setLocal(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 300);
  };
  React.useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  return (
    <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
      <input type="color" value={local} onChange={(e) => update(e.target.value)} style={{ width: 32, height: 32, border: "1px solid #c9cccf", borderRadius: 6, cursor: "pointer", padding: 2 }} />
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#202223" }}>{label}</label>
        <input value={local} onChange={(e) => update(e.target.value)} onBlur={() => onChange(local)} style={{ width: "100%", padding: "4px 8px", border: "1px solid #c9cccf", borderRadius: 4, fontSize: 11, marginTop: 2, boxSizing: "border-box" }} />
      </div>
    </div>
  );
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer", fontSize: 13 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 16, height: 16 }} />
      {label}
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#202223" }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 13, background: "#fff" }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min?: number; max?: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#202223" }}>{label}</label>
      <input type="number" value={value} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", padding: "8px 10px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
    </div>
  );
}

const SECTION_LABELS: Record<string, { label: string; icon: string }> = {
  // Shared
  "announcement": { label: "Barra de Anúncio", icon: "📢" },
  "header": { label: "Cabeçalho e Logo", icon: "🏪" },
  "newsletter": { label: "Newsletter", icon: "📬" },
  "footer": { label: "Rodapé", icon: "📎" },
  // Product
  "product-gallery": { label: "Galeria de Imagens", icon: "🖼️" },
  "product-info": { label: "Informações do Produto", icon: "💰" },
  "product-options": { label: "Seletores de Variante", icon: "🎨" },
  "product-cta": { label: "Botão de Compra", icon: "🛒" },
  "product-tabs": { label: "Abas do Produto", icon: "📋" },
  "product-recommendations": { label: "Recomendações", icon: "💡" },
  // Collection
  "collection-header": { label: "Cabeçalho da Coleção", icon: "📂" },
  "collection-grid": { label: "Grid de Produtos", icon: "📦" },
  "collection-filters": { label: "Filtros", icon: "🔍" },
  "collection-pagination": { label: "Paginação", icon: "📄" },
};

export default function FixedSectionEditor({ sectionId, config, onSave, onClose, token, saving }: Props) {
  const meta = SECTION_LABELS[sectionId] || { label: sectionId, icon: "📦" };

  return (
    <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: 12, overflow: "hidden", maxHeight: 620, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e1e3e5", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6d7175", padding: 0 }}>←</button>
        <span style={{ fontSize: 16 }}>{meta.icon}</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#202223" }}>{meta.label}</span>
        {saving && <span style={{ fontSize: 11, color: "#008060", marginLeft: "auto" }}>Salvando...</span>}
      </div>

      <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
        {/* ──── ANNOUNCEMENT BAR ──── */}
        {sectionId === "announcement" && (
          <>
            <CheckboxField label="Barra ativada" checked={config.announcementBar.enabled} onChange={(v) => onSave({ announcementBar: { ...config.announcementBar, enabled: v } })} />
            <Field label="Texto do anúncio" value={config.announcementBar.text} onChange={(v) => onSave({ announcementBar: { ...config.announcementBar, text: v } })} helpText="Ex: FRETE GRÁTIS acima de R$ 299" />
            <Field label="Link" value={config.announcementBar.linkUrl || ""} onChange={(v) => onSave({ announcementBar: { ...config.announcementBar, linkUrl: v || null } })} />
            <ColorField label="Cor de fundo" value={config.colors.announcementBarBg} onChange={(v) => onSave({ colors: { ...config.colors, announcementBarBg: v } })} />
            <ColorField label="Cor do texto" value={config.colors.announcementBarText} onChange={(v) => onSave({ colors: { ...config.colors, announcementBarText: v } })} />
          </>
        )}

        {/* ──── HEADER ──── */}
        {sectionId === "header" && (
          <>
            <Field label="Nome da loja" value={config.identity.storeName} onChange={(v) => onSave({ identity: { ...config.identity, storeName: v } })} />
            <Field label="Texto do logo" value={config.identity.logoText} onChange={(v) => onSave({ identity: { ...config.identity, logoText: v } })} />
            <ImageUpload label="Imagem do logo" value={config.identity.logoUrl || ""} onChange={(v) => onSave({ identity: { ...config.identity, logoUrl: v || null } })} token={token} previewSize={50} />
            <ColorField label="Fundo do header" value={config.colors.headerBg} onChange={(v) => onSave({ colors: { ...config.colors, headerBg: v } })} />
            <ColorField label="Texto do header" value={config.colors.headerText} onChange={(v) => onSave({ colors: { ...config.colors, headerText: v } })} />
          </>
        )}

        {/* ──── NEWSLETTER ──── */}
        {sectionId === "newsletter" && (
          <>
            <CheckboxField label="Ativada" checked={config.newsletter.enabled} onChange={(v) => onSave({ newsletter: { ...config.newsletter, enabled: v } })} />
            <Field label="Título" value={config.newsletter.title} onChange={(v) => onSave({ newsletter: { ...config.newsletter, title: v } })} />
            <Field label="Subtítulo" value={config.newsletter.subtitle} onChange={(v) => onSave({ newsletter: { ...config.newsletter, subtitle: v } })} />
            <ColorField label="Cor de fundo" value={config.newsletter.backgroundColor} onChange={(v) => onSave({ newsletter: { ...config.newsletter, backgroundColor: v } })} />
            <ColorField label="Cor do texto" value={config.newsletter.textColor} onChange={(v) => onSave({ newsletter: { ...config.newsletter, textColor: v } })} />
          </>
        )}

        {/* ──── FOOTER ──── */}
        {sectionId === "footer" && (
          <>
            <Field label="Copyright" value={config.footer.copyrightText} onChange={(v) => onSave({ footer: { ...config.footer, copyrightText: v } })} />
            <CheckboxField label="Mostrar newsletter no footer" checked={config.footer.showNewsletter} onChange={(v) => onSave({ footer: { ...config.footer, showNewsletter: v } })} />
            <ColorField label="Fundo" value={config.colors.footerBg} onChange={(v) => onSave({ colors: { ...config.colors, footerBg: v } })} />
            <ColorField label="Texto" value={config.colors.footerBodyText} onChange={(v) => onSave({ colors: { ...config.colors, footerBodyText: v } })} />
            <ColorField label="Títulos" value={config.colors.footerHeadingText} onChange={(v) => onSave({ colors: { ...config.colors, footerHeadingText: v } })} />
            <ColorField label="Links" value={config.colors.footerAccent} onChange={(v) => onSave({ colors: { ...config.colors, footerAccent: v } })} />
          </>
        )}

        {/* ──── PRODUCT GALLERY ──── */}
        {sectionId === "product-gallery" && (
          <>
            <p style={{ fontSize: 13, color: "#6d7175", marginBottom: 12 }}>Configuração da galeria de imagens do produto.</p>
            <CheckboxField label="Zoom ao passar o mouse" checked={config.animation.imageZoomOnHover} onChange={(v) => onSave({ animation: { ...config.animation, imageZoomOnHover: v } })} />
            <SelectField label="Proporção da imagem" value={config.product.imageSize} options={[
              { value: "natural", label: "Natural" },
              { value: "square", label: "Quadrada (1:1)" },
              { value: "short", label: "Curta (4:3)" },
              { value: "tall", label: "Alta (2:3)" },
            ]} onChange={(v) => onSave({ product: { ...config.product, imageSize: v as "natural" } })} />
          </>
        )}

        {/* ──── PRODUCT INFO ──── */}
        {sectionId === "product-info" && (
          <>
            <p style={{ fontSize: 13, color: "#6d7175", marginBottom: 12 }}>Configure como o preço e informações são exibidos.</p>
            <CheckboxField label="Mostrar vendedor/coleção" checked={config.product.showVendor} onChange={(v) => onSave({ product: { ...config.product, showVendor: v } })} />
            <CheckboxField label="Mostrar desconto" checked={config.product.showDiscount} onChange={(v) => onSave({ product: { ...config.product, showDiscount: v } })} />
            <SelectField label="Formato do desconto" value={config.product.discountMode} options={[
              { value: "percentage", label: "Porcentagem (20% OFF)" },
              { value: "saving", label: "Economia (- R$ 49,75)" },
            ]} onChange={(v) => onSave({ product: { ...config.product, discountMode: v as "percentage" } })} />
            <SelectField label="Posição do preço" value={config.product.pricePosition} options={[
              { value: "before_title", label: "Antes do título" },
              { value: "after_title", label: "Depois do título" },
            ]} onChange={(v) => onSave({ product: { ...config.product, pricePosition: v as "before_title" } })} />
            <ColorField label="Cor do preço em promoção" value={config.colors.onSaleAccent} onChange={(v) => onSave({ colors: { ...config.colors, onSaleAccent: v } })} />
          </>
        )}

        {/* ──── PRODUCT OPTIONS ──── */}
        {sectionId === "product-options" && (
          <>
            <p style={{ fontSize: 13, color: "#6d7175", marginBottom: 12 }}>Configuração dos seletores de variante.</p>
            <CheckboxField label="Mostrar swatches de cor" checked={config.product.showColorSwatch} onChange={(v) => onSave({ product: { ...config.product, showColorSwatch: v } })} />
            <CheckboxField label="Mostrar estoque" checked={config.product.showInventoryQuantity} onChange={(v) => onSave({ product: { ...config.product, showInventoryQuantity: v } })} />
            <NumberField label="Alerta de estoque baixo" value={config.product.lowInventoryThreshold} min={0} max={50} onChange={(v) => onSave({ product: { ...config.product, lowInventoryThreshold: v } })} />
            <ColorField label="Cor do destaque (selecionado)" value={config.colors.accentColor} onChange={(v) => onSave({ colors: { ...config.colors, accentColor: v } })} />
          </>
        )}

        {/* ──── PRODUCT CTA ──── */}
        {sectionId === "product-cta" && (
          <>
            <p style={{ fontSize: 13, color: "#6d7175", marginBottom: 12 }}>Aparência do botão de compra.</p>
            <ColorField label="Cor de fundo do botão" value={config.colors.primaryButtonBg} onChange={(v) => onSave({ colors: { ...config.colors, primaryButtonBg: v } })} />
            <ColorField label="Cor do texto do botão" value={config.colors.primaryButtonText} onChange={(v) => onSave({ colors: { ...config.colors, primaryButtonText: v } })} />
            <ColorField label="Cor do botão secundário (fundo)" value={config.colors.secondaryButtonBg} onChange={(v) => onSave({ colors: { ...config.colors, secondaryButtonBg: v } })} />
            <ColorField label="Cor do botão secundário (texto)" value={config.colors.secondaryButtonText} onChange={(v) => onSave({ colors: { ...config.colors, secondaryButtonText: v } })} />
          </>
        )}

        {/* ──── PRODUCT TABS ──── */}
        {sectionId === "product-tabs" && (
          <>
            <p style={{ fontSize: 13, color: "#6d7175", marginBottom: 12 }}>As abas mostram descrição, especificações, avaliações, perguntas e entrega.</p>
            <CheckboxField label="Mostrar avaliações" checked={config.product.showReviewsBadge} onChange={(v) => onSave({ product: { ...config.product, showReviewsBadge: v } })} />
            <ColorField label="Cor do destaque das abas" value={config.colors.accentColor} onChange={(v) => onSave({ colors: { ...config.colors, accentColor: v } })} />
          </>
        )}

        {/* ──── PRODUCT RECOMMENDATIONS ──── */}
        {sectionId === "product-recommendations" && (
          <>
            <p style={{ fontSize: 13, color: "#6d7175", marginBottom: 12 }}>Mostra produtos relacionados da mesma coleção.</p>
            <CheckboxField label="Mostrar imagem secundária no hover" checked={config.product.showSecondaryImage} onChange={(v) => onSave({ product: { ...config.product, showSecondaryImage: v } })} />
            <ColorField label="Cor do destaque" value={config.colors.accentColor} onChange={(v) => onSave({ colors: { ...config.colors, accentColor: v } })} />
          </>
        )}

        {/* ──── COLLECTION HEADER ──── */}
        {sectionId === "collection-header" && (
          <>
            <p style={{ fontSize: 13, color: "#6d7175", marginBottom: 12 }}>O cabeçalho mostra o nome da coleção e contagem de produtos.</p>
            <ColorField label="Cor do título" value={config.colors.headingColor} onChange={(v) => onSave({ colors: { ...config.colors, headingColor: v } })} />
            <ColorField label="Cor do texto" value={config.colors.textColor} onChange={(v) => onSave({ colors: { ...config.colors, textColor: v } })} />
          </>
        )}

        {/* ──── COLLECTION GRID ──── */}
        {sectionId === "collection-grid" && (
          <>
            <p style={{ fontSize: 13, color: "#6d7175", marginBottom: 12 }}>Configure como os produtos aparecem no grid.</p>
            <CheckboxField label="Mostrar imagem secundária no hover" checked={config.product.showSecondaryImage} onChange={(v) => onSave({ product: { ...config.product, showSecondaryImage: v } })} />
            <CheckboxField label="Mostrar desconto" checked={config.product.showDiscount} onChange={(v) => onSave({ product: { ...config.product, showDiscount: v } })} />
            <SelectField label="Proporção da imagem" value={config.product.imageSize} options={[
              { value: "natural", label: "Natural" },
              { value: "square", label: "Quadrada (1:1)" },
              { value: "short", label: "Curta (4:3)" },
              { value: "tall", label: "Alta (2:3)" },
            ]} onChange={(v) => onSave({ product: { ...config.product, imageSize: v as "natural" } })} />
            <ColorField label="Cor do preço em promoção" value={config.colors.onSaleAccent} onChange={(v) => onSave({ colors: { ...config.colors, onSaleAccent: v } })} />
          </>
        )}

        {/* ──── COLLECTION FILTERS ──── */}
        {sectionId === "collection-filters" && (
          <>
            <p style={{ fontSize: 13, color: "#6d7175", marginBottom: 12 }}>Os filtros permitem filtrar por preço, tamanho e cor.</p>
            <ColorField label="Cor do filtro ativo" value={config.colors.primaryButtonBg} onChange={(v) => onSave({ colors: { ...config.colors, primaryButtonBg: v } })} />
          </>
        )}

        {/* ──── COLLECTION PAGINATION ──── */}
        {sectionId === "collection-pagination" && (
          <>
            <p style={{ fontSize: 13, color: "#6d7175", marginBottom: 12 }}>A paginação aparece quando há mais produtos.</p>
            <ColorField label="Cor da página ativa" value={config.colors.accentColor} onChange={(v) => onSave({ colors: { ...config.colors, accentColor: v } })} />
          </>
        )}
      </div>
    </div>
  );
}
