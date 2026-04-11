"use client";

import React from "react";
import type { ThemeConfig, HomeSection } from "@/lib/theme-config";
import ImageUpload from "@/components/ImageUpload";

interface Props {
  section: HomeSection;
  index: number;
  config: ThemeConfig;
  onSave: (updates: Partial<ThemeConfig>) => Promise<void>;
  onUpdateSettings: (settings: Record<string, unknown>) => void;
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

function NumberField({ label, value, min, max, onChange, placeholder, helpText }: { label: string; value?: number; min?: number; max?: number; onChange: (v: number | undefined) => void; placeholder?: string; helpText?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#202223" }}>{label}</label>
      <input
        type="number"
        value={value ?? ""}
        placeholder={placeholder}
        min={min}
        max={max}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? undefined : Number(raw));
        }}
        style={{ width: "100%", padding: "8px 10px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}
      />
      {helpText && <p style={{ fontSize: 11, color: "#8c9196", marginTop: 2 }}>{helpText}</p>}
    </div>
  );
}

// Helper block rendered at the end of sections that support per-device image
// resizing. Keeps the three case blocks (slideshow, mosaic, offers) consistent
// in behaviour and copy so the admin doesn't have three subtly different UIs
// for the same feature.
interface ImageHeightPreset {
  key: string;
  label: string;
  desktop: number;
  mobile: number;
}

function ImageHeightFields({
  desktopValue,
  mobileValue,
  onDesktopChange,
  onMobileChange,
  label,
  defaults,
  presets,
}: {
  desktopValue?: number;
  mobileValue?: number;
  onDesktopChange: (v: number | undefined) => void;
  onMobileChange: (v: number | undefined) => void;
  label: string;
  defaults: { desktop: number; mobile: number };
  presets: ImageHeightPreset[];
}) {
  // Um preset está "ativo" se os dois valores atuais batem exatamente com os
  // do preset. Quando o desktop está vazio, consideramos o default; quando o
  // mobile está vazio, consideramos o mesmo que o desktop (mesma lógica do
  // componente renderer).
  const effectiveDesktop = desktopValue ?? defaults.desktop;
  const effectiveMobile = mobileValue ?? effectiveDesktop;

  const applyPreset = (p: ImageHeightPreset) => {
    onDesktopChange(p.desktop);
    onMobileChange(p.mobile);
  };

  const resetToDefault = () => {
    onDesktopChange(undefined);
    onMobileChange(undefined);
  };

  const isCustom = !presets.some((p) => p.desktop === effectiveDesktop && p.mobile === effectiveMobile);

  return (
    <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px dashed #e1e3e5" }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "#202223", marginBottom: 8 }}>{label}</p>

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: "#6d7175", margin: "0 0 6px" }}>Predefinições rápidas</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {presets.map((p) => {
            const active = !isCustom && p.desktop === effectiveDesktop && p.mobile === effectiveMobile;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => applyPreset(p)}
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  border: active ? "2px solid #008060" : "1px solid #c9cccf",
                  background: active ? "#f0fdf4" : "#fff",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: active ? 700 : 500,
                  color: active ? "#008060" : "#202223",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
                title={`${p.desktop}px desktop / ${p.mobile}px mobile`}
              >
                {p.label}
                <span style={{ display: "block", fontSize: 9, fontWeight: 400, opacity: 0.75, lineHeight: 1.4 }}>
                  Desktop: {p.desktop}px
                </span>
                <span style={{ display: "block", fontSize: 9, fontWeight: 400, opacity: 0.75, lineHeight: 1.4 }}>
                  Mobile: {p.mobile}px
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={resetToDefault}
            style={{
              padding: "6px 10px",
              fontSize: 11,
              border: "1px solid #c9cccf",
              background: "#fff",
              borderRadius: 6,
              cursor: "pointer",
              color: "#6d7175",
            }}
            title="Limpa os valores e volta ao padrão do tema"
          >
            ✕ Limpar
          </button>
        </div>
        {isCustom && (
          <p style={{ fontSize: 10, color: "#8c9196", margin: "6px 0 0" }}>
            Valores personalizados (Desktop: {effectiveDesktop}px / Mobile: {effectiveMobile}px)
          </p>
        )}
      </div>

      <NumberField
        label="Altura no desktop (px)"
        value={desktopValue}
        min={40}
        max={1200}
        placeholder={`Padrão: ${defaults.desktop}`}
        onChange={onDesktopChange}
      />
      <NumberField
        label="Altura no mobile (px)"
        value={mobileValue}
        min={40}
        max={1200}
        placeholder={`Padrão: ${defaults.mobile}`}
        onChange={onMobileChange}
        helpText="Deixe vazio para usar o mesmo valor do desktop."
      />
    </div>
  );
}

// Presets por tipo de seção. Valores escolhidos para cobrir os casos mais
// comuns sem sobrepor o NumberField de customização.
const SLIDESHOW_HEIGHT_PRESETS: ImageHeightPreset[] = [
  { key: "compact", label: "Compacto", desktop: 300, mobile: 200 },
  { key: "medium", label: "Médio", desktop: 500, mobile: 300 },
  { key: "large", label: "Grande", desktop: 700, mobile: 420 },
  { key: "hero", label: "Hero", desktop: 900, mobile: 520 },
];

const MOSAIC_HEIGHT_PRESETS: ImageHeightPreset[] = [
  { key: "compact", label: "Compacto", desktop: 180, mobile: 140 },
  { key: "medium", label: "Médio", desktop: 280, mobile: 200 },
  { key: "large", label: "Grande", desktop: 400, mobile: 260 },
];

const OFFERS_HEIGHT_PRESETS: ImageHeightPreset[] = [
  { key: "compact", label: "Compacto", desktop: 140, mobile: 120 },
  { key: "medium", label: "Médio", desktop: 220, mobile: 180 },
  { key: "large", label: "Grande", desktop: 320, mobile: 240 },
];

const IMAGE_WITH_TEXT_HEIGHT_PRESETS: ImageHeightPreset[] = [
  { key: "compact", label: "Compacto", desktop: 300, mobile: 200 },
  { key: "medium", label: "Médio", desktop: 450, mobile: 280 },
  { key: "large", label: "Grande", desktop: 600, mobile: 380 },
];

const BRAND_SHOWCASE_HEIGHT_PRESETS: ImageHeightPreset[] = [
  { key: "compact", label: "Compacto", desktop: 40, mobile: 32 },
  { key: "medium", label: "Médio", desktop: 60, mobile: 48 },
  { key: "large", label: "Grande", desktop: 90, mobile: 70 },
];

const LOGO_LIST_HEIGHT_PRESETS: ImageHeightPreset[] = [
  { key: "compact", label: "Compacto", desktop: 50, mobile: 36 },
  { key: "medium", label: "Médio", desktop: 70, mobile: 52 },
  { key: "large", label: "Grande", desktop: 100, mobile: 72 },
];

const TEXT_WITH_ICONS_SIZE_PRESETS: ImageHeightPreset[] = [
  { key: "compact", label: "Compacto", desktop: 24, mobile: 20 },
  { key: "medium", label: "Médio", desktop: 36, mobile: 28 },
  { key: "large", label: "Grande", desktop: 56, mobile: 44 },
];

export default function SectionEditor({ section, index, config, onSave, onUpdateSettings, onClose, token, saving }: Props) {
  const s = section.settings;
  const set = (key: string, value: unknown) => onUpdateSettings({ [key]: value });

  const SECTION_LABELS: Record<string, string> = {
    slideshow: "Banner / Slideshow",
    "text-with-icons": "Barra de benefícios",
    mosaic: "Mosaico",
    "featured-collection": "Coleção em destaque",
    offers: "Banners de oferta",
    "image-with-text": "Imagem com texto",
    "collection-list": "Grid de categorias",
    "info-bar": "Barra de informações",
    "logo-list": "Lista de logos",
    video: "Vídeo",
    "rich-text": "Texto formatado",
    "brand-showcase": "Vitrine da marca",
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: 12 }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e1e3e5", display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6d7175", padding: 0 }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#202223" }}>{SECTION_LABELS[section.type] || section.type}</span>
        {saving && <span style={{ fontSize: 11, color: "#008060", marginLeft: "auto" }}>Salvando...</span>}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {/* Common: enabled toggle */}
        <CheckboxField label="Seção ativada" checked={section.enabled} onChange={(v) => {
          // This needs to go through the parent
        }} />

        {/* ──── SLIDESHOW ──── */}
        {section.type === "slideshow" && (
          <>
            <CheckboxField label="Autoplay" checked={!!s.autoplay} onChange={(v) => set("autoplay", v)} />
            <ColorField label="Cor do texto" value={(s.textColor as string) || "#ffffff"} onChange={(v) => set("textColor", v)} />

            <p style={{ fontSize: 12, fontWeight: 600, color: "#202223", marginBottom: 8, marginTop: 12 }}>Slides</p>
            {((s.slides as Array<{ imageUrl?: string; mobileImageUrl?: string; title?: string; subtitle?: string; buttonLink?: string; imageOnly?: boolean }>) || []).map((slide, i) => {
              const updateSlide = (patch: Record<string, unknown>) => {
                const slides = [...((s.slides as Array<Record<string, unknown>>) || [])];
                slides[i] = { ...slides[i], ...patch };
                set("slides", slides);
              };
              return (
                <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: 12, marginBottom: 8, border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Slide {i + 1}</span>
                    <button onClick={() => { const slides = ((s.slides as unknown[]) || []).filter((_, j) => j !== i); set("slides", slides); }} style={{ fontSize: 12, color: "#e53e3e", background: "none", border: "none", cursor: "pointer" }}>Remover</button>
                  </div>
                  <ImageUpload label="Imagem Desktop" value={slide.imageUrl || ""} onChange={(v) => updateSlide({ imageUrl: v })} token={token} />
                  <ImageUpload label="Imagem Mobile" value={slide.mobileImageUrl || ""} onChange={(v) => updateSlide({ mobileImageUrl: v })} token={token} />

                  {/* Image-only toggle */}
                  <div style={{ marginTop: 10, marginBottom: 10, padding: "10px 12px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 6 }}>
                    <CheckboxField
                      label="Apenas imagem (sem texto sobreposto)"
                      checked={!!slide.imageOnly}
                      onChange={(v) => updateSlide({ imageOnly: v })}
                    />
                    <p style={{ fontSize: 11, color: "#0369a1", margin: "2px 0 0 22px", lineHeight: 1.4 }}>
                      Quando ativado, título/subtítulo são ignorados. O banner inteiro fica clicável se o link estiver preenchido.
                    </p>
                  </div>

                  {!slide.imageOnly && (
                    <>
                      <Field label="Título" value={slide.title || ""} onChange={(v) => updateSlide({ title: v })} />
                      <Field label="Subtítulo" value={slide.subtitle || ""} onChange={(v) => updateSlide({ subtitle: v })} />
                    </>
                  )}
                  <Field
                    label="Link do banner"
                    value={slide.buttonLink || ""}
                    onChange={(v) => updateSlide({ buttonLink: v })}
                    helpText="Ex: /collections/all — o banner inteiro vira o link"
                  />
                </div>
              );
            })}
            <button onClick={() => set("slides", [...((s.slides as unknown[]) || []), { imageUrl: "", mobileImageUrl: "", title: "", subtitle: "", buttonLink: "", imageOnly: false }])} style={{ width: "100%", padding: "8px", border: "1px dashed #c9cccf", borderRadius: 6, background: "none", cursor: "pointer", fontSize: 12, color: "#008060" }}>
              + Adicionar slide
            </button>
            <ImageHeightFields
              label="Tamanho da imagem do banner"
              desktopValue={s.imageHeight as number | undefined}
              mobileValue={s.imageHeightMobile as number | undefined}
              onDesktopChange={(v) => set("imageHeight", v)}
              onMobileChange={(v) => set("imageHeightMobile", v)}
              defaults={{ desktop: 500, mobile: 300 }}
              presets={SLIDESHOW_HEIGHT_PRESETS}
            />
          </>
        )}

        {/* ──── FEATURED COLLECTION ──── */}
        {section.type === "featured-collection" && (
          <>
            <Field label="Título" value={(s.title as string) || ""} onChange={(v) => set("title", v)} />
            <Field label="Handle da coleção" value={(s.collectionHandle as string) || ""} onChange={(v) => set("collectionHandle", v)} helpText="Ex: masculino, lancamentos" />
            <SelectField label="Limite de produtos" value={String(s.limit || 8)} options={[{ value: "4", label: "4" }, { value: "8", label: "8" }, { value: "12", label: "12" }, { value: "16", label: "16" }]} onChange={(v) => set("limit", Number(v))} />
          </>
        )}

        {/* ──── TEXT WITH ICONS ──── */}
        {section.type === "text-with-icons" && (
          <>
            <p style={{ fontSize: 12, color: "#6d7175", marginBottom: 12 }}>
              Itens da barra de benefícios. Você pode usar emoji <strong>OU</strong> fazer upload de uma imagem (a imagem prevalece).
            </p>
            {((s.items as Array<{ icon: string; iconImage?: string; title: string; text: string }>) || []).map((item, i) => {
              const updateItem = (patch: Partial<{ icon: string; iconImage?: string; title: string; text: string }>) => {
                const items = [...((s.items as Array<{ icon: string; iconImage?: string; title: string; text: string }>) || [])];
                items[i] = { ...items[i], ...patch };
                set("items", items);
              };
              return (
                <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: 12, marginBottom: 8, border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Item {i + 1}</span>
                    <button onClick={() => { const items = ((s.items as unknown[]) || []).filter((_, j) => j !== i); set("items", items); }} style={{ fontSize: 12, color: "#e53e3e", background: "none", border: "none", cursor: "pointer" }}>Remover</button>
                  </div>
                  <Field label="Ícone (emoji ou texto curto)" value={item.icon || ""} onChange={(v) => updateItem({ icon: v })} helpText="Usado quando não há imagem carregada abaixo." />
                  <ImageUpload label="Imagem do ícone (opcional)" value={item.iconImage || ""} onChange={(v) => updateItem({ iconImage: v || undefined })} token={token} previewSize={48} />
                  <Field label="Título" value={item.title || ""} onChange={(v) => updateItem({ title: v })} />
                  <Field label="Texto" value={item.text || ""} onChange={(v) => updateItem({ text: v })} />
                </div>
              );
            })}
            <button onClick={() => set("items", [...(s.items as unknown[] || []), { icon: "📦", iconImage: "", title: "Novo", text: "Descrição" }])} style={{ width: "100%", padding: "8px", border: "1px dashed #c9cccf", borderRadius: 6, background: "none", cursor: "pointer", fontSize: 12, color: "#008060" }}>
              + Adicionar item
            </button>
            <ImageHeightFields
              label="Tamanho do ícone-imagem"
              desktopValue={s.imageHeight as number | undefined}
              mobileValue={s.imageHeightMobile as number | undefined}
              onDesktopChange={(v) => set("imageHeight", v)}
              onMobileChange={(v) => set("imageHeightMobile", v)}
              defaults={{ desktop: 36, mobile: 28 }}
              presets={TEXT_WITH_ICONS_SIZE_PRESETS}
            />
          </>
        )}

        {/* ──── MOSAIC ──── */}
        {section.type === "mosaic" && (
          <>
            {((s.items as Array<{ title: string; image: string; link: string }>) || []).map((item, i) => (
              <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: 12, marginBottom: 8, border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Bloco {i + 1}</span>
                  <button onClick={() => { const items = (s.items as unknown[]).filter((_, j) => j !== i); set("items", items); }} style={{ fontSize: 12, color: "#e53e3e", background: "none", border: "none", cursor: "pointer" }}>Remover</button>
                </div>
                <Field label="Título" value={item.title} onChange={(v) => { const items = [...(s.items as Array<{ title: string; image: string; link: string }>)]; items[i] = { ...items[i], title: v }; set("items", items); }} />
                <Field label="Link" value={item.link} onChange={(v) => { const items = [...(s.items as Array<{ title: string; image: string; link: string }>)]; items[i] = { ...items[i], link: v }; set("items", items); }} />
                <ImageUpload label="Imagem" value={item.image} onChange={(v) => { const items = [...(s.items as Array<{ title: string; image: string; link: string }>)]; items[i] = { ...items[i], image: v }; set("items", items); }} token={token} />
              </div>
            ))}
            <button onClick={() => set("items", [...(s.items as unknown[] || []), { title: "Novo", image: "", link: "/" }])} style={{ width: "100%", padding: "8px", border: "1px dashed #c9cccf", borderRadius: 6, background: "none", cursor: "pointer", fontSize: 12, color: "#008060" }}>
              + Adicionar bloco
            </button>
            <ImageHeightFields
              label="Tamanho dos blocos do mosaico"
              desktopValue={s.imageHeight as number | undefined}
              mobileValue={s.imageHeightMobile as number | undefined}
              onDesktopChange={(v) => set("imageHeight", v)}
              onMobileChange={(v) => set("imageHeightMobile", v)}
              defaults={{ desktop: 280, mobile: 200 }}
              presets={MOSAIC_HEIGHT_PRESETS}
            />
          </>
        )}

        {/* ──── OFFERS ──── */}
        {section.type === "offers" && (
          <>
            {((s.items as Array<{ title: string; subtitle: string; image: string; link: string }>) || []).map((item, i) => (
              <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: 12, marginBottom: 8, border: "1px solid #e5e7eb" }}>
                <Field label="Título" value={item.title} onChange={(v) => { const items = [...(s.items as Array<{ title: string; subtitle: string; image: string; link: string }>)]; items[i] = { ...items[i], title: v }; set("items", items); }} />
                <Field label="Subtítulo" value={item.subtitle || ""} onChange={(v) => { const items = [...(s.items as Array<{ title: string; subtitle: string; image: string; link: string }>)]; items[i] = { ...items[i], subtitle: v }; set("items", items); }} />
                <Field label="Link" value={item.link || ""} onChange={(v) => { const items = [...(s.items as Array<{ title: string; subtitle: string; image: string; link: string }>)]; items[i] = { ...items[i], link: v }; set("items", items); }} />
                <ImageUpload label="Imagem" value={item.image || ""} onChange={(v) => { const items = [...(s.items as Array<{ title: string; subtitle: string; image: string; link: string }>)]; items[i] = { ...items[i], image: v }; set("items", items); }} token={token} />
              </div>
            ))}
            <button onClick={() => set("items", [...(s.items as unknown[] || []), { title: "Nova oferta", subtitle: "", image: "", link: "/" }])} style={{ width: "100%", padding: "8px", border: "1px dashed #c9cccf", borderRadius: 6, background: "none", cursor: "pointer", fontSize: 12, color: "#008060" }}>
              + Adicionar oferta
            </button>
            <ImageHeightFields
              label="Tamanho dos blocos de oferta"
              desktopValue={s.imageHeight as number | undefined}
              mobileValue={s.imageHeightMobile as number | undefined}
              onDesktopChange={(v) => set("imageHeight", v)}
              onMobileChange={(v) => set("imageHeightMobile", v)}
              defaults={{ desktop: 220, mobile: 180 }}
              presets={OFFERS_HEIGHT_PRESETS}
            />
          </>
        )}

        {/* ──── IMAGE WITH TEXT ──── */}
        {section.type === "image-with-text" && (
          <>
            <Field label="Título" value={(s.title as string) || ""} onChange={(v) => set("title", v)} />
            <Field label="Texto" value={(s.text as string) || ""} onChange={(v) => set("text", v)} multiline />
            <ImageUpload label="Imagem" value={(s.image as string) || ""} onChange={(v) => set("image", v)} token={token} />
            <SelectField label="Posição da imagem" value={(s.imagePosition as string) || "left"} options={[{ value: "left", label: "Esquerda" }, { value: "right", label: "Direita" }]} onChange={(v) => set("imagePosition", v)} />
            <Field label="Texto do botão" value={(s.buttonText as string) || ""} onChange={(v) => set("buttonText", v)} />
            <Field label="Link do botão" value={(s.buttonUrl as string) || ""} onChange={(v) => set("buttonUrl", v)} />
            <ImageHeightFields
              label="Tamanho da imagem"
              desktopValue={s.imageHeight as number | undefined}
              mobileValue={s.imageHeightMobile as number | undefined}
              onDesktopChange={(v) => set("imageHeight", v)}
              onMobileChange={(v) => set("imageHeightMobile", v)}
              defaults={{ desktop: 450, mobile: 280 }}
              presets={IMAGE_WITH_TEXT_HEIGHT_PRESETS}
            />
          </>
        )}

        {/* ──── COLLECTION LIST ──── */}
        {section.type === "collection-list" && (
          <>
            <Field label="Título da seção" value={(s.title as string) || ""} onChange={(v) => set("title", v)} />
            <p style={{ fontSize: 12, color: "#6d7175", marginBottom: 8 }}>As coleções em si (nome, imagem) são gerenciadas na aba Coleções.</p>
            <SelectField
              label="Colunas do grid"
              value={String(s.columns || 3)}
              options={[
                { value: "2", label: "2 colunas" },
                { value: "3", label: "3 colunas" },
                { value: "4", label: "4 colunas" },
                { value: "5", label: "5 colunas" },
                { value: "6", label: "6 colunas" },
              ]}
              onChange={(v) => set("columns", Number(v))}
            />
            <SelectField
              label="Linhas do grid"
              value={String(s.rows ?? 0)}
              options={[
                { value: "0", label: "Sem limite (mostrar todas)" },
                { value: "1", label: "1 linha" },
                { value: "2", label: "2 linhas" },
                { value: "3", label: "3 linhas" },
                { value: "4", label: "4 linhas" },
                { value: "5", label: "5 linhas" },
              ]}
              onChange={(v) => set("rows", Number(v))}
            />
            <p style={{ fontSize: 11, color: "#8c9196", marginTop: -6, marginBottom: 12, lineHeight: 1.5 }}>
              Define o limite máximo de categorias visíveis (colunas × linhas). &quot;Sem limite&quot; exibe todas as coleções cadastradas.
            </p>
            <SelectField
              label="Estilo do bloco"
              value={(s.blockStyle as string) || "contained"}
              options={[
                { value: "contained", label: "Bloco com foto dentro (altura fixa)" },
                { value: "image-fit", label: "Tamanho da própria foto" },
              ]}
              onChange={(v) => set("blockStyle", v)}
            />
            <CheckboxField
              label="Mostrar nome da categoria sobre a imagem"
              checked={(s.showTitles as boolean | undefined) ?? true}
              onChange={(v) => set("showTitles", v)}
            />
            <p style={{ fontSize: 11, color: "#8c9196", marginTop: -6, marginBottom: 8, lineHeight: 1.5 }}>
              Quando desativado, apenas a imagem aparece no bloco. O link para a coleção continua funcionando ao clicar.
            </p>
            <CheckboxField
              label="Animação ao passar o mouse"
              checked={(s.enableHoverAnimation as boolean | undefined) ?? true}
              onChange={(v) => set("enableHoverAnimation", v)}
            />
            <p style={{ fontSize: 11, color: "#8c9196", marginTop: -6, marginBottom: 8, lineHeight: 1.5 }}>
              Ao passar o mouse, o bloco sobe levemente e a imagem dá um zoom suave.
            </p>
          </>
        )}

        {/* ──── VIDEO ──── */}
        {section.type === "video" && (
          <>
            <Field label="Título" value={(s.title as string) || ""} onChange={(v) => set("title", v)} />
            <Field label="URL do vídeo (YouTube/Vimeo)" value={(s.videoUrl as string) || ""} onChange={(v) => set("videoUrl", v)} helpText="Cole o link completo do YouTube ou Vimeo" />
            <CheckboxField label="Reprodução automática" checked={!!s.autoplay} onChange={(v) => set("autoplay", v)} />
          </>
        )}

        {/* ──── RICH TEXT ──── */}
        {section.type === "rich-text" && (
          <>
            <Field label="Título" value={(s.title as string) || ""} onChange={(v) => set("title", v)} />
            <Field label="Conteúdo (HTML)" value={(s.content as string) || ""} onChange={(v) => set("content", v)} multiline helpText="Suporta HTML básico" />
          </>
        )}

        {/* ──── BRAND SHOWCASE ──── */}
        {section.type === "brand-showcase" && (
          <>
            <Field label="Título" value={(s.title as string) || ""} onChange={(v) => set("title", v)} />
            <Field label="Texto" value={(s.text as string) || ""} onChange={(v) => set("text", v)} multiline />
            <ImageUpload label="Imagem" value={(s.image as string) || ""} onChange={(v) => set("image", v)} token={token} />
            <ImageHeightFields
              label="Tamanho dos logos"
              desktopValue={s.imageHeight as number | undefined}
              mobileValue={s.imageHeightMobile as number | undefined}
              onDesktopChange={(v) => set("imageHeight", v)}
              onMobileChange={(v) => set("imageHeightMobile", v)}
              defaults={{ desktop: 60, mobile: 48 }}
              presets={BRAND_SHOWCASE_HEIGHT_PRESETS}
            />
          </>
        )}

        {/* ──── INFO BAR ──── */}
        {section.type === "info-bar" && (
          <>
            {((s.items as Array<{ icon: string; text: string }>) || []).map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input value={item.icon} onChange={(e) => { const items = [...(s.items as Array<{ icon: string; text: string }>)]; items[i] = { ...items[i], icon: e.target.value }; set("items", items); }} style={{ width: 40, padding: "6px", border: "1px solid #c9cccf", borderRadius: 4, fontSize: 16, textAlign: "center" }} />
                <input value={item.text} onChange={(e) => { const items = [...(s.items as Array<{ icon: string; text: string }>)]; items[i] = { ...items[i], text: e.target.value }; set("items", items); }} style={{ flex: 1, padding: "6px 8px", border: "1px solid #c9cccf", borderRadius: 4, fontSize: 12 }} />
                <button onClick={() => { const items = (s.items as unknown[]).filter((_, j) => j !== i); set("items", items); }} style={{ color: "#e53e3e", background: "none", border: "none", cursor: "pointer" }}>✕</button>
              </div>
            ))}
            <button onClick={() => set("items", [...(s.items as unknown[] || []), { icon: "📦", text: "Novo item" }])} style={{ width: "100%", padding: "6px", border: "1px dashed #c9cccf", borderRadius: 6, background: "none", cursor: "pointer", fontSize: 12, color: "#008060" }}>
              + Adicionar item
            </button>
          </>
        )}

        {/* ──── LOGO LIST ──── */}
        {section.type === "logo-list" && (
          <>
            <Field label="Título" value={(s.title as string) || ""} onChange={(v) => set("title", v)} />
            <p style={{ fontSize: 12, color: "#6d7175", margin: "0 0 8px" }}>Logos dos parceiros:</p>
            {((s.logos as Array<{ name: string; image: string; url: string }>) || []).map((logo, i) => (
              <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: 10, marginBottom: 6, border: "1px solid #e5e7eb" }}>
                <Field label="Nome" value={logo.name || ""} onChange={(v) => { const logos = [...(s.logos as Array<{ name: string; image: string; url: string }>)]; logos[i] = { ...logos[i], name: v }; set("logos", logos); }} />
                <Field label="URL" value={logo.url || ""} onChange={(v) => { const logos = [...(s.logos as Array<{ name: string; image: string; url: string }>)]; logos[i] = { ...logos[i], url: v }; set("logos", logos); }} />
                <ImageUpload label="Logo" value={logo.image || ""} onChange={(v) => { const logos = [...(s.logos as Array<{ name: string; image: string; url: string }>)]; logos[i] = { ...logos[i], image: v }; set("logos", logos); }} token={token} previewSize={40} />
              </div>
            ))}
            <button onClick={() => set("logos", [...(s.logos as unknown[] || []), { name: "", image: "", url: "" }])} style={{ width: "100%", padding: "6px", border: "1px dashed #c9cccf", borderRadius: 6, background: "none", cursor: "pointer", fontSize: 12, color: "#008060" }}>
              + Adicionar logo
            </button>
            <ImageHeightFields
              label="Tamanho dos logos"
              desktopValue={s.imageHeight as number | undefined}
              mobileValue={s.imageHeightMobile as number | undefined}
              onDesktopChange={(v) => set("imageHeight", v)}
              onMobileChange={(v) => set("imageHeightMobile", v)}
              defaults={{ desktop: 70, mobile: 52 }}
              presets={LOGO_LIST_HEIGHT_PRESETS}
            />
          </>
        )}
      </div>
    </div>
  );
}
