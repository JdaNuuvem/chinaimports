"use client";

import type { ThemeConfig, HomeSection } from "@/lib/theme-config";
import type { PreviewPage } from "./index";

interface Props {
  config: ThemeConfig;
  sections: HomeSection[];
  previewPage: PreviewPage;
  previewDevice: "desktop" | "mobile";
  selectedIndex: number | null;
  onSelectSection: (index: number) => void;
}

export default function PreviewPanel({ config, sections, previewPage, previewDevice, selectedIndex, onSelectSection }: Props) {
  const isMobile = previewDevice === "mobile";

  const sectionStyle = (index: number, clickable = true): React.CSSProperties => ({
    cursor: clickable ? "pointer" : "default",
    border: selectedIndex === index ? "2px solid #008060" : "1px dashed transparent",
    boxShadow: selectedIndex === index ? "0 0 0 2px rgba(0,128,96,0.2)" : "none",
    transition: "border 0.15s, box-shadow 0.15s",
    position: "relative",
  });

  const hoverBorder = {
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
      if (!e.currentTarget.style.border?.includes("#008060")) {
        e.currentTarget.style.border = "1px dashed #008060";
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
      if (!e.currentTarget.style.boxShadow?.includes("rgba")) {
        e.currentTarget.style.border = "1px dashed transparent";
      }
    },
  };

  const renderSectionPreview = (section: HomeSection, index: number) => {
    if (!section.enabled) {
      return (
        <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), padding: "6px 8px", background: "#f9fafb", textAlign: "center", fontSize: 8, color: "#9ca3af", opacity: 0.5 }} {...hoverBorder}>
          [{section.type}] desativada
        </div>
      );
    }

    const s = section.settings;

    switch (section.type) {
      case "slideshow":
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), background: (s.bgColor as string) || "#1e2d7d", color: (s.textColor as string) || "#fff", padding: isMobile ? "20px 12px" : "30px 16px", textAlign: "center" }} {...hoverBorder}>
            <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700 }}>{(s.title as string) || "Banner Principal"}</div>
            {s.subtitle ? <div style={{ fontSize: 8, opacity: 0.7, marginTop: 3 }}>{String(s.subtitle)}</div> : null}
            {s.buttonText ? <div style={{ marginTop: 6, display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 4, fontSize: 8 }}>{String(s.buttonText)}</div> : null}
          </div>
        );

      case "text-with-icons":
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), display: "flex", justifyContent: "space-around", padding: "8px", background: "#f6f6f7" }} {...hoverBorder}>
            {((s.items as Array<{ icon: string; title: string }>) || []).slice(0, isMobile ? 2 : 4).map((item, i) => (
              <span key={i} style={{ fontSize: 8 }}>{item.icon} {item.title}</span>
            ))}
          </div>
        );

      case "mosaic":
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : `repeat(${Math.min((s.items as unknown[])?.length || 3, 3)}, 1fr)`, gap: 4, padding: "8px" }} {...hoverBorder}>
            {((s.items as Array<{ title: string }>) || []).map((item, i) => (
              <div key={i} style={{ background: "#e1e3e5", borderRadius: 4, padding: "12px 4px", textAlign: "center", fontSize: 8, fontWeight: 600 }}>{item.title}</div>
            ))}
          </div>
        );

      case "featured-collection":
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), padding: "8px" }} {...hoverBorder}>
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>{(s.title as string) || "Coleção"} →</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 4 }}>
              {Array.from({ length: Math.min(Number(s.limit) || 4, isMobile ? 2 : 4) }).map((_, i) => (
                <div key={i} style={{ background: "#f0f0f0", borderRadius: 4, padding: isMobile ? "10px 0" : "16px 0", textAlign: "center", fontSize: 7 }}>Produto</div>
              ))}
            </div>
          </div>
        );

      case "offers":
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), display: "grid", gridTemplateColumns: isMobile ? "1fr" : `repeat(${Math.min((s.items as unknown[])?.length || 2, 2)}, 1fr)`, gap: 4, padding: "8px" }} {...hoverBorder}>
            {((s.items as Array<{ title: string; subtitle?: string }>) || []).map((item, i) => (
              <div key={i} style={{ background: config.colors.primaryButtonBg, color: config.colors.primaryButtonText, borderRadius: 4, padding: "8px", textAlign: "center", fontSize: 8, fontWeight: 700 }}>
                {item.title}
                {item.subtitle && <div style={{ fontSize: 7, fontWeight: 400, opacity: 0.8 }}>{item.subtitle}</div>}
              </div>
            ))}
          </div>
        );

      case "image-with-text":
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), display: "flex", flexDirection: isMobile ? "column" : ((s.imagePosition as string) === "right" ? "row-reverse" : "row"), gap: 8, padding: "8px" }} {...hoverBorder}>
            <div style={{ width: isMobile ? "100%" : "50%", background: "#e1e3e5", borderRadius: 4, minHeight: 40 }} />
            <div style={{ width: isMobile ? "100%" : "50%", fontSize: 8, padding: 4 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{(s.title as string) || "Título"}</div>
              <div style={{ color: "#6d7175", lineHeight: 1.3 }}>{((s.text as string) || "").slice(0, 50)}...</div>
            </div>
          </div>
        );

      case "collection-list":
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), padding: "8px" }} {...hoverBorder}>
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{(s.title as string) || "Categorias"}</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 4 }}>
              {["Masc", "Fem", "Inf", "Calç", "Acess", "Outlet"].map((c) => (
                <div key={c} style={{ background: "#f0f0f0", borderRadius: 4, padding: "8px 0", textAlign: "center", fontSize: 7 }}>{c}</div>
              ))}
            </div>
          </div>
        );

      case "video":
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), background: "#000", color: "#fff", padding: "20px 16px", textAlign: "center" }} {...hoverBorder}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>▶</div>
            <div style={{ fontSize: 9 }}>{(s.title as string) || "Vídeo"}</div>
          </div>
        );

      case "rich-text":
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), padding: "12px", textAlign: "center" }} {...hoverBorder}>
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>{(s.title as string) || "Texto"}</div>
            <div style={{ fontSize: 8, color: "#6d7175" }}>{((s.content as string) || "").replace(/<[^>]+>/g, "").slice(0, 60)}...</div>
          </div>
        );

      case "brand-showcase":
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), display: "flex", gap: 8, padding: "8px", background: "#f9fafb" }} {...hoverBorder}>
            <div style={{ width: "40%", background: "#e1e3e5", borderRadius: 4, minHeight: 30 }} />
            <div style={{ flex: 1, fontSize: 8 }}>
              <div style={{ fontWeight: 700 }}>{(s.title as string) || "Marca"}</div>
              <div style={{ color: "#6d7175" }}>{((s.text as string) || "").slice(0, 40)}</div>
            </div>
          </div>
        );

      case "info-bar":
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), display: "flex", justifyContent: "space-around", padding: "6px", background: "#f6f6f7" }} {...hoverBorder}>
            {((s.items as Array<{ icon: string; text: string }>) || []).slice(0, isMobile ? 2 : 4).map((item, i) => (
              <span key={i} style={{ fontSize: 7 }}>{item.icon} {item.text}</span>
            ))}
          </div>
        );

      case "logo-list":
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), padding: "8px", textAlign: "center" }} {...hoverBorder}>
            <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 4 }}>{(s.title as string) || "Parceiros"}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ width: 24, height: 24, background: "#e1e3e5", borderRadius: 4 }} />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div key={section.id} onClick={() => onSelectSection(index)} style={{ ...sectionStyle(index), padding: "8px", background: "#f9fafb", textAlign: "center", fontSize: 8, color: "#6d7175" }} {...hoverBorder}>
            [{section.type}]
          </div>
        );
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{
        background: "#fff", border: "1px solid #e1e3e5",
        borderRadius: isMobile ? 24 : 12,
        overflow: "hidden",
        width: isMobile ? 375 : "100%",
        boxShadow: isMobile ? "0 8px 30px rgba(0,0,0,0.12)" : "none",
        transition: "width 0.3s, border-radius 0.3s",
      }}>
        {/* Browser chrome */}
        {!isMobile ? (
          <div style={{ padding: "8px 16px", background: "#f6f6f7", borderBottom: "1px solid #e1e3e5", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
            </div>
            <div style={{ flex: 1, background: "#fff", borderRadius: 4, padding: "4px 10px", fontSize: 11, color: "#6d7175", textAlign: "center" }}>
              sua-loja.com{previewPage === "product" ? "/product/exemplo" : previewPage === "collection" ? "/collections/masculino" : ""}
            </div>
          </div>
        ) : (
          <div style={{ padding: "6px 0", display: "flex", justifyContent: "center", background: "#1a1a2e", borderBottom: "1px solid #333" }}>
            <div style={{ width: 60, height: 4, borderRadius: 2, background: "#444" }} />
          </div>
        )}

        {/* Page preview */}
        <div style={{ padding: isMobile ? 8 : 12, maxHeight: 560, overflowY: "auto" }}>
          {/* Announcement */}
          <div style={{ background: config.colors.announcementBarBg, color: config.colors.announcementBarText, padding: "4px", textAlign: "center", fontSize: 8, borderRadius: "4px 4px 0 0" }}>
            {config.announcementBar.text.slice(0, 40)}
          </div>

          {/* Header */}
          <div style={{ background: config.colors.headerBg, color: config.colors.headerText, padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 900, fontSize: 9, letterSpacing: 1 }}>{config.identity.logoText}</span>
            <div style={{ display: "flex", gap: 6, fontSize: 7 }}>
              {config.header.navLinks.slice(0, isMobile ? 2 : 4).map((l) => <span key={l.href}>{l.title}</span>)}
            </div>
          </div>

          {/* Dynamic sections (home only) */}
          {previewPage === "home" && sections.map((section, index) => renderSectionPreview(section, index))}

          {/* Product page preview */}
          {previewPage === "product" && (
            <div style={{ fontSize: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8, padding: 8 }}>
                <div style={{ background: "#f0f0f0", borderRadius: 4, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📷</div>
                <div style={{ padding: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>Camiseta UA Tech 2.0</div>
                  <div style={{ fontSize: 10, color: config.colors.onSaleAccent, fontWeight: 700 }}>R$ 199,00</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                    {["P", "M", "G", "GG"].map((s) => <span key={s} style={{ fontSize: 8, border: "1px solid #ccc", borderRadius: 3, padding: "2px 6px" }}>{s}</span>)}
                  </div>
                  <div style={{ marginTop: 8, background: config.colors.primaryButtonBg, color: config.colors.primaryButtonText, padding: "6px", borderRadius: 4, textAlign: "center", fontSize: 9, fontWeight: 700 }}>COMPRAR AGORA</div>
                </div>
              </div>
            </div>
          )}

          {/* Collection page preview */}
          {previewPage === "collection" && (
            <div style={{ padding: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Masculino</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 6 }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} style={{ background: "#f0f0f0", borderRadius: 4, padding: "16px 0", textAlign: "center", fontSize: 7 }}>
                    <div>📦</div>
                    <div style={{ marginTop: 2 }}>Produto {i}</div>
                    <div style={{ color: config.colors.onSaleAccent, fontWeight: 700 }}>R$ 199</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter */}
          {(previewPage === "home") && (
            <div style={{ background: config.newsletter.backgroundColor, color: config.newsletter.textColor, padding: "8px 12px", textAlign: "center", fontSize: 8 }}>
              📬 {config.newsletter.title}
            </div>
          )}

          {/* Footer */}
          <div style={{ background: config.colors.footerBg, color: config.colors.footerBodyText, padding: "8px 10px", fontSize: 7, textAlign: "center" }}>
            {config.footer.copyrightText}
          </div>
        </div>
      </div>
    </div>
  );
}
