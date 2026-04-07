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
            <p style={{ fontSize: 12, color: "#6d7175", marginBottom: 12 }}>Itens da barra de benefícios:</p>
            {((s.items as Array<{ icon: string; title: string; text: string }>) || []).map((item, i) => (
              <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: 12, marginBottom: 8, border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <Field label="Ícone" value={item.icon} onChange={(v) => { const items = [...(s.items as Array<{ icon: string; title: string; text: string }>)]; items[i] = { ...items[i], icon: v }; set("items", items); }} />
                  <button onClick={() => { const items = (s.items as Array<{ icon: string; title: string; text: string }>).filter((_, j) => j !== i); set("items", items); }} style={{ fontSize: 14, color: "#e53e3e", background: "none", border: "none", cursor: "pointer", alignSelf: "flex-start", marginTop: 20 }}>✕</button>
                </div>
                <Field label="Título" value={item.title} onChange={(v) => { const items = [...(s.items as Array<{ icon: string; title: string; text: string }>)]; items[i] = { ...items[i], title: v }; set("items", items); }} />
                <Field label="Texto" value={item.text} onChange={(v) => { const items = [...(s.items as Array<{ icon: string; title: string; text: string }>)]; items[i] = { ...items[i], text: v }; set("items", items); }} />
              </div>
            ))}
            <button onClick={() => set("items", [...(s.items as unknown[] || []), { icon: "📦", title: "Novo", text: "Descrição" }])} style={{ width: "100%", padding: "8px", border: "1px dashed #c9cccf", borderRadius: 6, background: "none", cursor: "pointer", fontSize: 12, color: "#008060" }}>
              + Adicionar item
            </button>
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
          </>
        )}

        {/* ──── COLLECTION LIST ──── */}
        {section.type === "collection-list" && (
          <>
            <Field label="Título" value={(s.title as string) || ""} onChange={(v) => set("title", v)} />
            <p style={{ fontSize: 12, color: "#6d7175", marginBottom: 8 }}>As coleções são gerenciadas na aba Coleções.</p>
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
          </>
        )}
      </div>
    </div>
  );
}
