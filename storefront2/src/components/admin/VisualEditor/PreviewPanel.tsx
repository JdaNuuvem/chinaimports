"use client";

import { useEffect, useState } from "react";
import type { ThemeConfig, HomeSection } from "@/lib/theme-config";
import type { PreviewPage } from "./index";

interface Props {
  config: ThemeConfig;
  sections: HomeSection[];
  previewPage: PreviewPage;
  previewDevice: "desktop" | "mobile";
  selectedIndex: number | null;
  onSelectSection: (index: number) => void;
  backendUrl: string;
}

// Minimal product shape we read from /store/products. The backend returns
// formatProduct(p) — see backend/server.js. We only consume the fields the
// preview actually renders, so this stays narrow on purpose.
interface PreviewProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  images?: Array<{ id: string; url: string }>;
  variants?: Array<{ prices?: Array<{ amount: number; currency_code: string }> }>;
}

const formatBRL = (centavos: number) =>
  `R$ ${(centavos / 100).toFixed(2).replace(".", ",")}`;

const productImage = (p: PreviewProduct): string | null =>
  p.thumbnail || p.images?.[0]?.url || null;

const productPriceCents = (p: PreviewProduct): number | null =>
  p.variants?.[0]?.prices?.[0]?.amount ?? null;

export default function PreviewPanel({
  config,
  sections,
  previewPage,
  previewDevice,
  selectedIndex,
  onSelectSection,
  backendUrl,
}: Props) {
  const isMobile = previewDevice === "mobile";

  // Real product data for the preview. Fetched once per backendUrl change.
  // We use the public storefront endpoint (no auth) so the preview matches
  // what the live shop would render. If the fetch fails (offline backend,
  // empty catalog) we fall back to the previous schematic placeholders.
  const [products, setProducts] = useState<PreviewProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setProductsLoading(true);
    fetch(`${backendUrl}/store/products?limit=12`)
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((data: { products?: PreviewProduct[] }) => {
        if (cancelled) return;
        setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [backendUrl]);

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

  // Renders a small product card for featured-collection / collection grids.
  // Uses real product data when available; otherwise an empty grey tile so
  // section sizing stays stable.
  const productTile = (p: PreviewProduct | null, key: string | number) => {
    const img = p ? productImage(p) : null;
    const price = p ? productPriceCents(p) : null;
    return (
      <div
        key={key}
        style={{
          background: "#f0f0f0",
          borderRadius: 4,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            aspectRatio: "1",
            background: img ? `url(${img}) center/cover no-repeat` : "#e1e3e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#9ca3af",
          }}
        >
          {!img && "📦"}
        </div>
        <div style={{ padding: "4px 4px 6px", textAlign: "center" }}>
          <div
            style={{
              fontSize: 7,
              fontWeight: 600,
              color: "#202223",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p ? p.title : "Produto"}
          </div>
          {price !== null && (
            <div style={{ fontSize: 7, color: config.colors.onSaleAccent, fontWeight: 700 }}>
              {formatBRL(price)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSectionPreview = (section: HomeSection, index: number) => {
    if (!section.enabled) {
      return (
        <div
          key={section.id}
          onClick={() => onSelectSection(index)}
          style={{
            ...sectionStyle(index),
            padding: "6px 8px",
            background: "#f9fafb",
            textAlign: "center",
            fontSize: 8,
            color: "#9ca3af",
            opacity: 0.5,
          }}
          {...hoverBorder}
        >
          [{section.type}] desativada
        </div>
      );
    }

    const s = section.settings;

    switch (section.type) {
      case "slideshow": {
        // Use the first slide that has an imageUrl (mobile-first when on
        // mobile preview). Falls back to the legacy colored block when no
        // images are configured yet.
        const slides = (s.slides as Array<{ imageUrl?: string; mobileImageUrl?: string; title?: string; subtitle?: string; imageOnly?: boolean }>) || [];
        const firstSlide = slides[0] || null;
        const slideImg = isMobile
          ? firstSlide?.mobileImageUrl || firstSlide?.imageUrl || null
          : firstSlide?.imageUrl || firstSlide?.mobileImageUrl || null;
        // Respeita o checkbox "Apenas imagem (sem texto sobreposto)" do
        // SectionEditor. Quando ativo, o preview não renderiza nenhum
        // overlay de texto — nem título, nem subtítulo, nem o fallback
        // "Slideshow (N slides)". Se ainda não há imagem configurada,
        // mostramos um placeholder discreto para o card não colapsar.
        const hideTextOverlay = !!firstSlide?.imageOnly;

        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{
              ...sectionStyle(index),
              background: slideImg
                ? `url(${slideImg}) center/cover no-repeat`
                : (s.bgColor as string) || "#1e2d7d",
              color: (s.textColor as string) || "#fff",
              padding: isMobile ? "30px 12px" : "44px 16px",
              textAlign: "center",
              minHeight: isMobile ? 80 : 110,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textShadow: slideImg ? "0 1px 4px rgba(0,0,0,0.5)" : undefined,
            }}
            {...hoverBorder}
          >
            {!hideTextOverlay && firstSlide?.title && (
              <div style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700 }}>{firstSlide.title}</div>
            )}
            {!hideTextOverlay && !firstSlide?.title && (
              <div style={{ fontSize: isMobile ? 10 : 12, fontWeight: 700, opacity: 0.85 }}>
                Slideshow ({slides.length} {slides.length === 1 ? "slide" : "slides"})
              </div>
            )}
            {!hideTextOverlay && firstSlide?.subtitle && (
              <div style={{ fontSize: isMobile ? 8 : 9, marginTop: 3, opacity: 0.9 }}>{firstSlide.subtitle}</div>
            )}
            {hideTextOverlay && !slideImg && (
              <div style={{ fontSize: isMobile ? 9 : 10, fontWeight: 600, opacity: 0.6 }}>
                Slide sem imagem
              </div>
            )}
          </div>
        );
      }

      case "text-with-icons":
        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{ ...sectionStyle(index), display: "flex", justifyContent: "space-around", padding: "8px", background: "#f6f6f7", alignItems: "center" }}
            {...hoverBorder}
          >
            {((s.items as Array<{ icon: string; iconImage?: string; title: string }>) || [])
              .slice(0, isMobile ? 2 : 4)
              .map((item, i) => (
                <span key={i} style={{ fontSize: 8, display: "inline-flex", alignItems: "center", gap: 3 }}>
                  {item.iconImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.iconImage}
                      alt=""
                      style={{ width: 14, height: 14, objectFit: "contain" }}
                    />
                  ) : (
                    <span>{item.icon}</span>
                  )}
                  <span>{item.title}</span>
                </span>
              ))}
          </div>
        );

      case "mosaic": {
        const items = (s.items as Array<{ title: string; image: string; link: string }>) || [];
        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{
              ...sectionStyle(index),
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : `repeat(${Math.min(items.length || 3, 3)}, 1fr)`,
              gap: 4,
              padding: "8px",
            }}
            {...hoverBorder}
          >
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  background: item.image ? `url(${item.image}) center/cover no-repeat` : "#e1e3e5",
                  borderRadius: 4,
                  padding: "16px 4px",
                  textAlign: "center",
                  fontSize: 8,
                  fontWeight: 700,
                  color: item.image ? "#fff" : "#202223",
                  textShadow: item.image ? "0 1px 3px rgba(0,0,0,0.6)" : undefined,
                  minHeight: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.title}
              </div>
            ))}
          </div>
        );
      }

      case "featured-collection": {
        // Use real products when available. We don't filter by collection
        // handle here — for the preview the goal is to show that *something*
        // looks right; strict per-collection filtering would require an
        // extra collections lookup and is not worth the complexity.
        const limit = Math.min(Number(s.limit) || 4, isMobile ? 4 : 8);
        const slice = products.slice(0, limit);
        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{ ...sectionStyle(index), padding: "8px" }}
            {...hoverBorder}
          >
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
              {(s.title as string) || "Coleção"} →
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                gap: 4,
              }}
            >
              {slice.length > 0
                ? slice.map((p, i) => productTile(p, p.id || i))
                : Array.from({ length: isMobile ? 2 : 4 }).map((_, i) =>
                    productTile(null, `placeholder-${i}`)
                  )}
            </div>
            {productsLoading && slice.length === 0 && (
              <div style={{ fontSize: 8, color: "#9ca3af", textAlign: "center", marginTop: 4 }}>
                Carregando produtos…
              </div>
            )}
          </div>
        );
      }

      case "offers": {
        const items = (s.items as Array<{ title: string; subtitle?: string; image: string; link: string }>) || [];
        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{
              ...sectionStyle(index),
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : `repeat(${Math.min(items.length || 2, 2)}, 1fr)`,
              gap: 4,
              padding: "8px",
            }}
            {...hoverBorder}
          >
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  background: item.image
                    ? `url(${item.image}) center/cover no-repeat`
                    : config.colors.primaryButtonBg,
                  color: item.image ? "#fff" : config.colors.primaryButtonText,
                  borderRadius: 4,
                  padding: "16px 8px",
                  textAlign: "center",
                  fontSize: 9,
                  fontWeight: 700,
                  minHeight: 50,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  textShadow: item.image ? "0 1px 3px rgba(0,0,0,0.6)" : undefined,
                }}
              >
                {item.title}
                {item.subtitle && (
                  <div style={{ fontSize: 7, fontWeight: 400, opacity: 0.9, marginTop: 2 }}>
                    {item.subtitle}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }

      case "image-with-text": {
        const img = s.image as string | undefined;
        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{
              ...sectionStyle(index),
              display: "flex",
              flexDirection: isMobile
                ? "column"
                : (s.imagePosition as string) === "right"
                  ? "row-reverse"
                  : "row",
              gap: 8,
              padding: "8px",
            }}
            {...hoverBorder}
          >
            <div
              style={{
                width: isMobile ? "100%" : "50%",
                background: img ? `url(${img}) center/cover no-repeat` : "#e1e3e5",
                borderRadius: 4,
                minHeight: 60,
              }}
            />
            <div style={{ width: isMobile ? "100%" : "50%", fontSize: 8, padding: 4 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{(s.title as string) || "Título"}</div>
              <div style={{ color: "#6d7175", lineHeight: 1.3 }}>
                {((s.text as string) || "").slice(0, 50)}
                {((s.text as string) || "").length > 50 ? "…" : ""}
              </div>
            </div>
          </div>
        );
      }

      case "collection-list": {
        // Respeita os settings configurados no SectionEditor:
        //   - `columns`: número de colunas (2-6)
        //   - `rows`: limite de linhas (0 = sem limite, 1-5 = cap em columns*rows)
        //   - `blockStyle`: "contained" (card com altura fixa) ou "image-fit"
        //     (tile flui no aspect ratio natural da imagem)
        //   - `showTitles`: se o nome da categoria é renderizado no tile
        //   - `enableHoverAnimation`: se o tile sobe/faz zoom ao passar o mouse
        // O preview continua com rótulos mockados porque não tem acesso direto
        // aos dados reais de coleções aqui — a ideia é mostrar o layout, não
        // o catálogo. A aba "Coleções" é quem edita as coleções reais.
        const rawColumns = Number(s.columns) || 3;
        const safeColumns = Math.max(2, Math.min(6, Math.floor(rawColumns)));
        const rawRows = Number(s.rows) || 0;
        const safeRows = Math.max(0, Math.min(10, Math.floor(rawRows)));
        const blockStyle = ((s.blockStyle as string) || "contained") === "image-fit" ? "image-fit" : "contained";
        const showTitles = (s.showTitles as boolean | undefined) ?? true;
        const enableHoverAnimation = (s.enableHoverAnimation as boolean | undefined) ?? true;
        const mobileCols = Math.max(2, Math.ceil(safeColumns / 2));
        const effectiveCols = isMobile ? mobileCols : safeColumns;
        // Mock pool grande o suficiente pra cobrir 6×5 = 30 tiles.
        const mockPool = [
          "Masc", "Fem", "Inf", "Calç", "Acess", "Outlet",
          "Esporte", "Fitness", "Tech", "Casa", "Decor", "Beleza",
          "Pets", "Infantil", "Bebê", "Camping", "Viagem", "Livros",
          "Games", "Auto", "Ferramentas", "Jardim", "Móveis", "Cozinha",
          "Música", "Arte", "Moda", "Luxo", "Outdoor", "Saúde",
        ];
        // Quantos tiles exibir: se rows>0, respeita cap; senão mostra
        // `effectiveCols * 2` (duas linhas por default pra dar sensação de grid).
        const defaultTileCount = effectiveCols * 2;
        const capByRows = safeRows > 0 ? safeColumns * safeRows : Infinity;
        const tileCount = Math.min(
          safeRows > 0 ? Math.min(capByRows, mockPool.length) : defaultTileCount,
          mockPool.length
        );
        const mockCategories = mockPool.slice(0, tileCount);
        // Unique class pra hover do preview (não conflita com a live store).
        const previewHoverClass = "collection-tile-preview-hover";

        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{ ...sectionStyle(index), padding: "8px" }}
            {...hoverBorder}
          >
            {enableHoverAnimation && (
              <style>{`
                .${previewHoverClass} {
                  transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .${previewHoverClass}:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
                }
              `}</style>
            )}
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>
              {(s.title as string) || "Categorias"}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${effectiveCols}, 1fr)`,
                gap: blockStyle === "image-fit" ? 3 : 4,
              }}
            >
              {mockCategories.map((c, i) => (
                <div
                  key={`${c}-${i}`}
                  className={enableHoverAnimation ? previewHoverClass : undefined}
                  style={{
                    background: "#f0f0f0",
                    borderRadius: blockStyle === "image-fit" ? 0 : 4,
                    padding: blockStyle === "image-fit" ? "0" : "8px 0",
                    aspectRatio: blockStyle === "image-fit" ? "1" : undefined,
                    textAlign: "center",
                    fontSize: 7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6d7175",
                  }}
                >
                  {showTitles ? c : ""}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "video":
        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{
              ...sectionStyle(index),
              background: "#000",
              color: "#fff",
              padding: "20px 16px",
              textAlign: "center",
            }}
            {...hoverBorder}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>▶</div>
            <div style={{ fontSize: 9 }}>{(s.title as string) || "Vídeo"}</div>
          </div>
        );

      case "rich-text":
        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{ ...sectionStyle(index), padding: "12px", textAlign: "center" }}
            {...hoverBorder}
          >
            <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>
              {(s.title as string) || "Texto"}
            </div>
            <div style={{ fontSize: 8, color: "#6d7175" }}>
              {((s.content as string) || "").replace(/<[^>]+>/g, "").slice(0, 60)}…
            </div>
          </div>
        );

      case "brand-showcase": {
        const img = s.image as string | undefined;
        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{ ...sectionStyle(index), display: "flex", gap: 8, padding: "8px", background: "#f9fafb" }}
            {...hoverBorder}
          >
            <div
              style={{
                width: "40%",
                background: img ? `url(${img}) center/cover no-repeat` : "#e1e3e5",
                borderRadius: 4,
                minHeight: 50,
              }}
            />
            <div style={{ flex: 1, fontSize: 8 }}>
              <div style={{ fontWeight: 700 }}>{(s.title as string) || "Marca"}</div>
              <div style={{ color: "#6d7175" }}>{((s.text as string) || "").slice(0, 60)}</div>
            </div>
          </div>
        );
      }

      case "info-bar":
        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{
              ...sectionStyle(index),
              display: "flex",
              justifyContent: "space-around",
              padding: "6px",
              background: "#f6f6f7",
            }}
            {...hoverBorder}
          >
            {((s.items as Array<{ icon: string; text: string }>) || [])
              .slice(0, isMobile ? 2 : 4)
              .map((item, i) => (
                <span key={i} style={{ fontSize: 7 }}>
                  {item.icon} {item.text}
                </span>
              ))}
          </div>
        );

      case "logo-list": {
        const logos = (s.logos as Array<{ name: string; image: string; url: string }>) || [];
        const visible = logos.length > 0 ? logos.slice(0, 6) : [];
        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{ ...sectionStyle(index), padding: "8px", textAlign: "center" }}
            {...hoverBorder}
          >
            <div style={{ fontSize: 9, fontWeight: 700, marginBottom: 4 }}>
              {(s.title as string) || "Parceiros"}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              {visible.length > 0
                ? visible.map((logo, i) =>
                    logo.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        key={i}
                        src={logo.image}
                        alt={logo.name || ""}
                        style={{ width: 32, height: 24, objectFit: "contain" }}
                      />
                    ) : (
                      <div
                        key={i}
                        style={{ width: 32, height: 24, background: "#e1e3e5", borderRadius: 4 }}
                      />
                    )
                  )
                : Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      style={{ width: 32, height: 24, background: "#e1e3e5", borderRadius: 4 }}
                    />
                  ))}
            </div>
          </div>
        );
      }

      default:
        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(index)}
            style={{
              ...sectionStyle(index),
              padding: "8px",
              background: "#f9fafb",
              textAlign: "center",
              fontSize: 8,
              color: "#6d7175",
            }}
            {...hoverBorder}
          >
            [{section.type}]
          </div>
        );
    }
  };

  // Pick a featured product for the product page preview. We use the first
  // real product when available, otherwise the legacy hardcoded placeholder.
  const heroProduct = products[0] || null;
  const heroImg = heroProduct ? productImage(heroProduct) : null;
  const heroPrice = heroProduct ? productPriceCents(heroProduct) : null;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e1e3e5",
          borderRadius: isMobile ? 24 : 12,
          overflow: "hidden",
          width: isMobile ? 375 : "100%",
          boxShadow: isMobile ? "0 8px 30px rgba(0,0,0,0.12)" : "none",
          transition: "width 0.3s, border-radius 0.3s",
        }}
      >
        {/* Browser chrome */}
        {!isMobile ? (
          <div
            style={{
              padding: "8px 16px",
              background: "#f6f6f7",
              borderBottom: "1px solid #e1e3e5",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
            </div>
            <div
              style={{
                flex: 1,
                background: "#fff",
                borderRadius: 4,
                padding: "4px 10px",
                fontSize: 11,
                color: "#6d7175",
                textAlign: "center",
              }}
            >
              sua-loja.com
              {previewPage === "product"
                ? `/product/${heroProduct?.handle || "exemplo"}`
                : previewPage === "collection"
                  ? "/collections/masculino"
                  : ""}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "6px 0",
              display: "flex",
              justifyContent: "center",
              background: "#1a1a2e",
              borderBottom: "1px solid #333",
            }}
          >
            <div style={{ width: 60, height: 4, borderRadius: 2, background: "#444" }} />
          </div>
        )}

        {/* Page preview */}
        <div style={{ padding: isMobile ? 8 : 12, maxHeight: 560, overflowY: "auto" }}>
          {/* Announcement */}
          <div
            style={{
              background: config.colors.announcementBarBg,
              color: config.colors.announcementBarText,
              padding: "4px",
              textAlign: "center",
              fontSize: 8,
              borderRadius: "4px 4px 0 0",
            }}
          >
            {config.announcementBar.text.slice(0, 40)}
          </div>

          {/* Header — render the uploaded logo image when configured, falling
              back to the text logo. logoHeight is honored if set. */}
          <div
            style={{
              background: config.colors.headerBg,
              color: config.colors.headerText,
              padding: "6px 10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {config.identity.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={config.identity.logoUrl}
                alt={config.identity.logoText || config.identity.storeName || "logo"}
                style={{
                  height: Math.max(10, Math.min((config.identity.logoHeight || 40) / 3, 24)),
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            ) : (
              <span style={{ fontWeight: 900, fontSize: 9, letterSpacing: 1 }}>
                {config.identity.logoText}
              </span>
            )}
            <div style={{ display: "flex", gap: 6, fontSize: 7 }}>
              {config.header.navLinks.slice(0, isMobile ? 2 : 4).map((l) => (
                <span key={l.href}>{l.title}</span>
              ))}
            </div>
          </div>

          {/* Dynamic sections (home only) */}
          {previewPage === "home" && sections.map((section, index) => renderSectionPreview(section, index))}

          {/* Product page preview — uses the first real product when one is
              available so the preview reflects the actual catalog. */}
          {previewPage === "product" && (
            <div style={{ fontSize: 0 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 8,
                  padding: 8,
                }}
              >
                <div
                  style={{
                    background: heroImg ? `url(${heroImg}) center/cover no-repeat` : "#f0f0f0",
                    borderRadius: 4,
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {!heroImg && "📷"}
                </div>
                <div style={{ padding: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                    {heroProduct?.title || "Camiseta UA Tech 2.0"}
                  </div>
                  <div style={{ fontSize: 10, color: config.colors.onSaleAccent, fontWeight: 700 }}>
                    {heroPrice !== null ? formatBRL(heroPrice) : "R$ 199,00"}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                    {["P", "M", "G", "GG"].map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: 8,
                          border: "1px solid #ccc",
                          borderRadius: 3,
                          padding: "2px 6px",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      background: config.colors.primaryButtonBg,
                      color: config.colors.primaryButtonText,
                      padding: "6px",
                      borderRadius: 4,
                      textAlign: "center",
                      fontSize: 9,
                      fontWeight: 700,
                    }}
                  >
                    COMPRAR AGORA
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collection page preview — uses real products when available */}
          {previewPage === "collection" && (
            <div style={{ padding: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>Coleção</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                  gap: 6,
                }}
              >
                {products.length > 0
                  ? products.slice(0, isMobile ? 4 : 6).map((p, i) => productTile(p, p.id || i))
                  : Array.from({ length: isMobile ? 4 : 6 }).map((_, i) =>
                      productTile(null, `placeholder-${i}`)
                    )}
              </div>
              {productsLoading && products.length === 0 && (
                <div
                  style={{
                    fontSize: 9,
                    color: "#9ca3af",
                    textAlign: "center",
                    marginTop: 6,
                  }}
                >
                  Carregando produtos…
                </div>
              )}
            </div>
          )}

          {/* Newsletter */}
          {previewPage === "home" && (
            <div
              style={{
                background: config.newsletter.backgroundColor,
                color: config.newsletter.textColor,
                padding: "8px 12px",
                textAlign: "center",
                fontSize: 8,
              }}
            >
              📬 {config.newsletter.title}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              background: config.colors.footerBg,
              color: config.colors.footerBodyText,
              padding: "8px 10px",
              fontSize: 7,
              textAlign: "center",
            }}
          >
            {config.footer.copyrightText}
          </div>
        </div>
      </div>
    </div>
  );
}
