"use client";

import { useState } from "react";
import type { ThemeConfig, HomeSection, HomeSectionType } from "@/lib/theme-config";
import type { PreviewPage } from "./index";

const SECTION_META: Record<string, { label: string; icon: string }> = {
  slideshow: { label: "Banner / Slideshow", icon: "🖼️" },
  "text-with-icons": { label: "Barra de benefícios", icon: "✨" },
  mosaic: { label: "Mosaico de categorias", icon: "🧩" },
  "featured-collection": { label: "Coleção em destaque", icon: "📦" },
  offers: { label: "Banners de oferta", icon: "🏷️" },
  "image-with-text": { label: "Imagem com texto", icon: "📝" },
  "collection-list": { label: "Grid de categorias", icon: "📂" },
  "info-bar": { label: "Barra de informações", icon: "ℹ️" },
  "logo-list": { label: "Lista de logos", icon: "🏢" },
  video: { label: "Vídeo", icon: "🎬" },
  "rich-text": { label: "Texto formatado", icon: "📄" },
  "brand-showcase": { label: "Vitrine da marca", icon: "⭐" },
};

const FIXED_SECTIONS: Array<{ id: string; label: string; icon: string; pages: PreviewPage[] }> = [
  { id: "announcement", label: "Barra de anúncio", icon: "📢", pages: ["home", "product", "collection"] },
  { id: "header", label: "Cabeçalho", icon: "🏪", pages: ["home", "product", "collection"] },
  { id: "newsletter", label: "Newsletter", icon: "📬", pages: ["home"] },
  { id: "footer", label: "Rodapé", icon: "📎", pages: ["home", "product", "collection"] },
];

const PRODUCT_SECTIONS = [
  { id: "product-gallery", label: "Galeria de imagens", icon: "🖼️" },
  { id: "product-info", label: "Informações do produto", icon: "💰" },
  { id: "product-options", label: "Seletores de variante", icon: "🎨" },
  { id: "product-cta", label: "Botão de compra", icon: "🛒" },
  { id: "product-tabs", label: "Abas do produto", icon: "📋" },
  { id: "product-recommendations", label: "Recomendações", icon: "💡" },
];

const COLLECTION_SECTIONS = [
  { id: "collection-header", label: "Cabeçalho da coleção", icon: "📂" },
  { id: "collection-grid", label: "Grid de produtos", icon: "📦" },
  { id: "collection-pagination", label: "Paginação", icon: "📄" },
];

const ADDABLE_TYPES: Array<{ type: HomeSectionType; label: string; icon: string }> = [
  { type: "slideshow", label: "Banner / Slideshow", icon: "🖼️" },
  { type: "featured-collection", label: "Coleção em destaque", icon: "📦" },
  { type: "text-with-icons", label: "Barra de benefícios", icon: "✨" },
  { type: "mosaic", label: "Mosaico", icon: "🧩" },
  { type: "offers", label: "Banners de oferta", icon: "🏷️" },
  { type: "image-with-text", label: "Imagem com texto", icon: "📝" },
  { type: "collection-list", label: "Grid de categorias", icon: "📂" },
  { type: "info-bar", label: "Barra de informações", icon: "ℹ️" },
  { type: "logo-list", label: "Lista de logos", icon: "🏢" },
  { type: "video", label: "Vídeo", icon: "🎬" },
  { type: "rich-text", label: "Texto formatado", icon: "📄" },
  { type: "brand-showcase", label: "Vitrine da marca", icon: "⭐" },
];

interface Props {
  sections: HomeSection[];
  previewPage: PreviewPage;
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
  selectedFixedId?: string | null;
  onSelectFixed?: (id: string | null) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
  onToggle: (index: number) => void;
  onAdd: (type: HomeSectionType) => void;
  config: ThemeConfig;
}

export default function SectionList({ sections, previewPage, selectedIndex, selectedFixedId, onSelect, onSelectFixed, onMove, onDuplicate, onRemove, onToggle, onAdd, config }: Props) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ index: number; x: number; y: number } | null>(null);

  const topFixed = FIXED_SECTIONS.filter((s) => ["announcement", "header"].includes(s.id) && s.pages.includes(previewPage));
  const bottomFixed = FIXED_SECTIONS.filter((s) => ["newsletter", "footer"].includes(s.id) && s.pages.includes(previewPage));

  const renderFixedItem = (item: { id: string; label: string; icon: string }) => {
    const isSelected = selectedFixedId === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onSelectFixed?.(isSelected ? null : item.id)}
        style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left",
          padding: "10px 14px", border: "none", cursor: "pointer", fontSize: 12,
          background: isSelected ? "#f0fdf4" : "#f9fafb",
          borderLeft: isSelected ? "3px solid #008060" : "3px solid #e5e7eb",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <span style={{ fontSize: 14 }}>{item.icon}</span>
        <span style={{ color: isSelected ? "#202223" : "#6d7175", fontWeight: isSelected ? 700 : 400 }}>{item.label}</span>
        <span style={{ marginLeft: "auto", fontSize: 9, color: "#9ca3af" }}>fixo</span>
      </button>
    );
  };

  if (previewPage === "product") {
    return (
      <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #e1e3e5", fontSize: 12, fontWeight: 700, color: "#202223" }}>
          Seções do Produto
        </div>
        <div style={{ maxHeight: 560, overflowY: "auto" }}>
          {topFixed.map((s) => renderFixedItem(s))}
          {PRODUCT_SECTIONS.map((s) => {
            const isSelected = selectedFixedId === s.id;
            return (
              <button key={s.id} onClick={() => onSelectFixed?.(isSelected ? null : s.id)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "10px 14px", border: "none", cursor: "pointer", fontSize: 12, background: isSelected ? "#f0fdf4" : "transparent", borderLeft: isSelected ? "3px solid #008060" : "3px solid transparent", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontWeight: isSelected ? 700 : 500, color: "#202223" }}>{s.label}</span>
              </button>
            );
          })}
          {bottomFixed.map((s) => renderFixedItem(s))}
        </div>
      </div>
    );
  }

  if (previewPage === "collection") {
    return (
      <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #e1e3e5", fontSize: 12, fontWeight: 700, color: "#202223" }}>
          Seções da Coleção
        </div>
        <div style={{ maxHeight: 560, overflowY: "auto" }}>
          {topFixed.map((s) => renderFixedItem(s))}
          {COLLECTION_SECTIONS.map((s) => {
            const isSelected = selectedFixedId === s.id;
            return (
              <button key={s.id} onClick={() => onSelectFixed?.(isSelected ? null : s.id)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", padding: "10px 14px", border: "none", cursor: "pointer", fontSize: 12, background: isSelected ? "#f0fdf4" : "transparent", borderLeft: isSelected ? "3px solid #008060" : "3px solid transparent", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontWeight: isSelected ? 700 : 500, color: "#202223" }}>{s.label}</span>
              </button>
            );
          })}
          {bottomFixed.map((s) => renderFixedItem(s))}
        </div>
      </div>
    );
  }

  // HOME page — sortable sections
  return (
    <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #e1e3e5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#202223" }}>Seções da Home ({sections.length})</span>
        <button onClick={() => setShowAddMenu(!showAddMenu)} style={{ fontSize: 18, background: "none", border: "none", cursor: "pointer", color: "#008060", lineHeight: 1 }} title="Adicionar seção">
          +
        </button>
      </div>

      {/* Add section menu */}
      {showAddMenu && (
        <div style={{ padding: 8, borderBottom: "1px solid #e1e3e5", background: "#f9fafb", maxHeight: 200, overflowY: "auto" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#6d7175", margin: "0 0 6px", padding: "0 4px" }}>Adicionar seção:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {ADDABLE_TYPES.map((t) => (
              <button key={t.type} onClick={() => { onAdd(t.type); setShowAddMenu(false); }} style={{ padding: "6px 8px", fontSize: 10, border: "1px solid #e1e3e5", borderRadius: 6, background: "#fff", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 4 }}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxHeight: 500, overflowY: "auto" }}>
        {/* Fixed top */}
        {topFixed.map((s) => renderFixedItem(s))}

        {/* Dynamic sections */}
        {sections.map((section, index) => {
          const meta = SECTION_META[section.type] || { label: section.type, icon: "📦" };
          const isSelected = selectedIndex === index;
          return (
            <div
              key={section.id}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 10px",
                background: isSelected ? "#f0fdf4" : "transparent",
                borderLeft: isSelected ? "3px solid #008060" : "3px solid transparent",
                borderBottom: "1px solid #f0f0f0",
                opacity: section.enabled ? 1 : 0.5,
                cursor: "pointer",
              }}
              onClick={() => onSelect(isSelected ? null : index)}
              onContextMenu={(e) => { e.preventDefault(); setContextMenu({ index, x: e.clientX, y: e.clientY }); }}
            >
              {/* Drag handle */}
              <span style={{ fontSize: 10, color: "#c9cccf", cursor: "grab", userSelect: "none" }}>⋮⋮</span>
              <span style={{ fontSize: 14 }}>{meta.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: "#202223", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {(section.settings?.title as string) || meta.label}
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ display: "flex", gap: 2 }} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => handleToggle(index)} title={section.enabled ? "Desativar" : "Ativar"} style={{ fontSize: 11, background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: section.enabled ? "#008060" : "#9ca3af" }}>
                  {section.enabled ? "👁" : "👁‍🗨"}
                </button>
                <button onClick={() => onMove(index, "up")} disabled={index === 0} title="Mover para cima" style={{ fontSize: 11, background: "none", border: "none", cursor: index === 0 ? "not-allowed" : "pointer", padding: "2px 4px", color: index === 0 ? "#e5e7eb" : "#6d7175" }}>
                  ▲
                </button>
                <button onClick={() => onMove(index, "down")} disabled={index === sections.length - 1} title="Mover para baixo" style={{ fontSize: 11, background: "none", border: "none", cursor: index === sections.length - 1 ? "not-allowed" : "pointer", padding: "2px 4px", color: index === sections.length - 1 ? "#e5e7eb" : "#6d7175" }}>
                  ▼
                </button>
                <button onClick={() => onDuplicate(index)} title="Duplicar" style={{ fontSize: 11, background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "#6d7175" }}>
                  ⧉
                </button>
                <button onClick={() => { if (confirm("Remover esta seção?")) onRemove(index); }} title="Remover" style={{ fontSize: 11, background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "#e53e3e" }}>
                  ✕
                </button>
              </div>
            </div>
          );

          function handleToggle(i: number) { onToggle(i); }
        })}

        {sections.length === 0 && (
          <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>
            Nenhuma seção. Clique em + para adicionar.
          </div>
        )}

        {/* Fixed bottom */}
        {bottomFixed.map((s) => renderFixedItem(s))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setContextMenu(null)} />
          <div style={{ position: "fixed", left: contextMenu.x, top: contextMenu.y, zIndex: 999, background: "#fff", border: "1px solid #e1e3e5", borderRadius: 8, padding: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: 140 }}>
            {[
              { label: "▲ Mover para cima", action: () => onMove(contextMenu.index, "up"), disabled: contextMenu.index === 0 },
              { label: "▼ Mover para baixo", action: () => onMove(contextMenu.index, "down"), disabled: contextMenu.index === sections.length - 1 },
              { label: "⧉ Duplicar", action: () => onDuplicate(contextMenu.index) },
              { label: sections[contextMenu.index]?.enabled ? "👁‍🗨 Desativar" : "👁 Ativar", action: () => onToggle(contextMenu.index) },
              { label: "✕ Remover", action: () => { if (confirm("Remover?")) onRemove(contextMenu.index); }, danger: true },
            ].map((item) => (
              <button
                key={item.label}
                disabled={"disabled" in item ? item.disabled : false}
                onClick={() => { item.action(); setContextMenu(null); }}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "8px 12px", border: "none", borderRadius: 4,
                  cursor: ("disabled" in item && item.disabled) ? "not-allowed" : "pointer", fontSize: 12, background: "transparent",
                  color: "danger" in item && item.danger ? "#e53e3e" : "#202223",
                  opacity: ("disabled" in item && item.disabled) ? 0.4 : 1,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
