"use client";

import { useState } from "react";
import type { ThemeConfig, HomeSection, HomeSectionType } from "@/lib/theme-config";
import SectionList from "./SectionList";
import SectionEditor from "./SectionEditor";
import FixedSectionEditor from "./FixedSectionEditor";
import PreviewPanel from "./PreviewPanel";

export type PreviewPage = "home" | "product" | "collection";

interface VisualEditorProps {
  config: ThemeConfig;
  onSave: (updates: Partial<ThemeConfig>) => Promise<void>;
  saving: boolean;
  token: string;
}

export default function VisualEditor({ config, onSave, saving, token }: VisualEditorProps) {
  const [previewPage, setPreviewPage] = useState<PreviewPage>("home");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  // For product/collection pages — selected fixed section ID
  const [selectedFixedSection, setSelectedFixedSection] = useState<string | null>(null);

  const sections = config.homeSections || [];

  const updateSections = (newSections: HomeSection[]) => {
    onSave({ homeSections: newSections });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const next = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    updateSections(next);
    setSelectedSectionIndex(targetIndex);
  };

  const handleDuplicate = (index: number) => {
    const section = sections[index];
    const duplicate: HomeSection = {
      ...section,
      id: `${section.type}_${Date.now()}`,
      settings: { ...section.settings },
    };
    const next = [...sections];
    next.splice(index + 1, 0, duplicate);
    updateSections(next);
    setSelectedSectionIndex(index + 1);
  };

  const handleRemove = (index: number) => {
    const next = sections.filter((_, i) => i !== index);
    updateSections(next);
    setSelectedSectionIndex(null);
  };

  const handleToggle = (index: number) => {
    const next = sections.map((s, i) =>
      i === index ? { ...s, enabled: !s.enabled } : s
    );
    updateSections(next);
  };

  const handleAddSection = (type: HomeSectionType) => {
    const newSection: HomeSection = {
      id: `${type}_${Date.now()}`,
      type,
      enabled: true,
      settings: getDefaultSettings(type),
    };
    updateSections([...sections, newSection]);
    setSelectedSectionIndex(sections.length);
  };

  const handleUpdateSettings = (index: number, settings: Record<string, unknown>) => {
    const next = sections.map((s, i) =>
      i === index ? { ...s, settings: { ...s.settings, ...settings } } : s
    );
    updateSections(next);
  };

  const handleSelectSection = (index: number | null) => {
    setSelectedSectionIndex(index);
    setSelectedFixedSection(null);
  };

  const handleSelectFixed = (id: string | null) => {
    setSelectedFixedSection(id);
    setSelectedSectionIndex(null);
  };

  const selectedSection = selectedSectionIndex !== null ? sections[selectedSectionIndex] : null;
  const hasEditor = selectedSection !== null || selectedFixedSection !== null;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {(["home", "product", "collection"] as const).map((p) => (
            <button
              key={p}
              onClick={() => { setPreviewPage(p); setSelectedSectionIndex(null); setSelectedFixedSection(null); }}
              style={{
                padding: "6px 16px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                border: previewPage === p ? "2px solid #008060" : "1px solid #c9cccf",
                background: previewPage === p ? "#f0fdf4" : "#fff",
                fontWeight: previewPage === p ? 700 : 400,
                color: previewPage === p ? "#008060" : "#202223",
              }}
            >
              {p === "home" ? "Página Inicial" : p === "product" ? "Produto" : "Coleção"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid #c9cccf", borderRadius: 8, padding: 3 }}>
          <button onClick={() => setPreviewDevice("desktop")} title="Desktop" style={{ padding: "5px 10px", borderRadius: 5, border: "none", cursor: "pointer", background: previewDevice === "desktop" ? "#202223" : "transparent", color: previewDevice === "desktop" ? "#fff" : "#6d7175", fontSize: 15 }}>🖥</button>
          <button onClick={() => setPreviewDevice("mobile")} title="Mobile" style={{ padding: "5px 10px", borderRadius: 5, border: "none", cursor: "pointer", background: previewDevice === "mobile" ? "#202223" : "transparent", color: previewDevice === "mobile" ? "#fff" : "#6d7175", fontSize: 15 }}>📱</button>
        </div>
      </div>

      {/* 3-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: hasEditor ? "240px 360px 1fr" : "300px 1fr", gap: 16, minHeight: 600 }}>
        {/* Col 1: Section list */}
        <SectionList
          sections={sections}
          previewPage={previewPage}
          selectedIndex={selectedSectionIndex}
          selectedFixedId={selectedFixedSection}
          onSelect={handleSelectSection}
          onSelectFixed={handleSelectFixed}
          onMove={handleMove}
          onDuplicate={handleDuplicate}
          onRemove={handleRemove}
          onToggle={handleToggle}
          onAdd={handleAddSection}
          config={config}
        />

        {/* Col 2: Section editor (home sections) */}
        {selectedSection && selectedSectionIndex !== null && (
          <SectionEditor
            section={selectedSection}
            index={selectedSectionIndex}
            config={config}
            onSave={onSave}
            onUpdateSettings={(settings) => handleUpdateSettings(selectedSectionIndex, settings)}
            onClose={() => setSelectedSectionIndex(null)}
            token={token}
            saving={saving}
          />
        )}

        {/* Col 2: Fixed section editor (product/collection sections) */}
        {selectedFixedSection && (
          <FixedSectionEditor
            sectionId={selectedFixedSection}
            config={config}
            onSave={onSave}
            onClose={() => setSelectedFixedSection(null)}
            token={token}
            saving={saving}
          />
        )}

        {/* Col 3: Preview */}
        <PreviewPanel
          config={config}
          sections={sections}
          previewPage={previewPage}
          previewDevice={previewDevice}
          selectedIndex={selectedSectionIndex}
          onSelectSection={handleSelectSection}
        />
      </div>
    </div>
  );
}

function getDefaultSettings(type: HomeSectionType): Record<string, unknown> {
  switch (type) {
    case "slideshow": return { title: "Novo Banner", subtitle: "Subtítulo", buttonText: "Ver mais", buttonUrl: "/collections/all", bgColor: "#1e2d7d", textColor: "#ffffff" };
    case "featured-collection": return { title: "Coleção em Destaque", collectionHandle: "", limit: 8 };
    case "text-with-icons": return { items: [{ icon: "🚚", title: "Frete Grátis", text: "Acima de R$ 299" }, { icon: "↩️", title: "Troca Grátis", text: "30 dias" }, { icon: "🔒", title: "Compra Segura", text: "SSL" }] };
    case "mosaic": return { items: [{ title: "Masculino", image: "", link: "/collections/masculino" }, { title: "Feminino", image: "", link: "/collections/feminino" }] };
    case "offers": return { items: [{ title: "20% OFF", subtitle: "Em toda a loja", image: "", link: "/collections/all" }] };
    case "image-with-text": return { title: "Sobre a marca", text: "Texto sobre a marca...", image: "", imagePosition: "left" };
    case "collection-list": return { title: "Categorias", collections: [] };
    case "info-bar": return { items: [{ icon: "🚚", text: "Frete grátis acima de R$ 299" }] };
    case "logo-list": return { title: "Parceiros", logos: [] };
    case "video": return { title: "Vídeo", videoUrl: "", autoplay: false };
    case "rich-text": return { title: "Texto", content: "<p>Seu conteúdo aqui...</p>" };
    case "brand-showcase": return { title: "Marca", text: "Sobre a marca", image: "" };
    default: return {};
  }
}
