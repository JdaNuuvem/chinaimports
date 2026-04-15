"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CollectionCard {
  id: string;
  title: string;
  handle: string;
  image?: string;
  productCount?: number;
}

interface CollectionListProps {
  title?: string;
  collections?: CollectionCard[];
  /** Number of grid columns on desktop. Mobile is clamped to ceil(columns/2). */
  columns?: number;
  /**
   * Maximum number of rows to show. The total number of visible tiles is
   * capped at `columns * rows`. Use `0` (default) to show every collection
   * without a cap.
   */
  rows?: number;
  /**
   * Visual style of each category tile:
   * - "contained": fixed-height card with image covering it and a gradient
   *   overlay for the title (the historical default)
   * - "image-fit": the tile flows at the image's natural aspect ratio with
   *   no wrapper chrome, so the picture itself dictates the block size
   */
  blockStyle?: "contained" | "image-fit";
  /** When false, the category name is never rendered — only the image. */
  showTitles?: boolean;
  /**
   * When true, hovering a tile lifts it 3px, applies a soft drop shadow and
   * zooms the image by ~8%. Rendered via an inline <style> tag because this
   * component is consumed both on the public storefront and inside the admin
   * preview iframe/card — we want the hover rule to live with the component.
   */
  enableHoverAnimation?: boolean;
}

export default function CollectionList({
  title = "Nossas Coleções",
  collections: propCollections,
  columns = 3,
  rows = 0,
  blockStyle = "contained",
  showTitles = true,
  enableHoverAnimation = true,
}: CollectionListProps) {
  const [collections, setCollections] = useState<CollectionCard[]>(propCollections || []);
  const [loading, setLoading] = useState(!propCollections?.length);

  useEffect(() => {
    if (propCollections?.length) return;

    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    fetch(`${backendUrl}/store/collections`)
      .then((r) => r.json())
      .then((data) => {
        if (data.collections?.length > 0) {
          setCollections(
            data.collections.map((col: { id: string; title: string; handle: string; imageUrl?: string; productCount?: number }) => ({
              id: col.id,
              title: col.title,
              handle: col.handle,
              image: col.imageUrl || undefined,
              productCount: col.productCount,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propCollections]);

  // Clamp columns to a sane range so a buggy settings value can't break the grid.
  const safeColumns = Math.max(1, Math.min(6, Math.floor(columns || 3)));
  // rows === 0 means "no cap"; any positive value caps visible tiles at
  // columns * rows. Clamp to a sane range so absurd values don't break layout.
  const safeRows = Math.max(0, Math.min(10, Math.floor(rows || 0)));
  const maxVisible = safeRows > 0 ? safeColumns * safeRows : Infinity;

  // Hover animation — injected once per render via a <style> tag keyed by a
  // stable class name. We use a unique class so we don't collide with any
  // global CSS or with the admin preview's own hover rule.
  const hoverClass = "collection-card-live-hover";

  // Responsive columns via pure CSS Grid — we use auto-fit with a minimum
  // column width derived from the desktop column count so the grid naturally
  // collapses on narrow viewports without needing a media query.
  const minColWidth = blockStyle === "image-fit" ? 160 : 220;
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${minColWidth}px), 1fr))`,
    // Hard cap at the configured number of columns via an extra wrapper width
    // fallback: when there's room for more than `safeColumns`, CSS grid would
    // still only fill up to the intrinsic width. To enforce the cap on wide
    // viewports we rely on maxWidth below.
    gap: blockStyle === "image-fit" ? "12px" : "20px",
    maxWidth: `${safeColumns * (minColWidth + 20)}px`,
    marginLeft: "auto",
    marginRight: "auto",
  };

  if (loading) {
    return (
      <section className="section" data-section-type="collection-list">
        <div className="container">
          {title && (
            <header className="section__header">
              <h2 className="section__title heading h3">{title}</h2>
            </header>
          )}
          <div style={gridStyle}>
            {Array.from({ length: safeColumns }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: blockStyle === "image-fit" ? 180 : 220,
                  borderRadius: blockStyle === "image-fit" ? 0 : 12,
                  background: "#f0f0f0",
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!collections.length) return null;

  // Apply the rows cap. `Infinity` means "no slice" — we still call .slice
  // because Array.prototype.slice handles Infinity correctly and it keeps
  // the downstream map straightforward.
  const visibleCollections =
    maxVisible === Infinity ? collections : collections.slice(0, maxVisible);

  return (
    <section className="section" data-section-type="collection-list">
      {enableHoverAnimation && (
        <style>{`
          .${hoverClass} {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            will-change: transform;
          }
          .${hoverClass}:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
          }
          .${hoverClass} img {
            transition: transform 0.5s ease;
          }
          .${hoverClass}:hover img {
            transform: scale(1.06);
          }
        `}</style>
      )}
      <div className="container">
        {title && (
          <header className="section__header">
            <h2 className="section__title heading h3">{title}</h2>
          </header>
        )}
        <div style={gridStyle}>
          {visibleCollections.map((col) => {
            if (blockStyle === "image-fit") {
              // Picture flows at its natural aspect ratio. No card chrome, no
              // fixed height, no gradient overlay. If `showTitles` is on, a
              // small caption sits below the image in normal document flow.
              return (
                <Link
                  key={col.id}
                  href={`/collections/${col.handle}`}
                  className={enableHoverAnimation ? hoverClass : undefined}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    overflow: "hidden",
                  }}
                >
                  {col.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={col.image}
                      alt={col.title}
                      style={{
                        display: "block",
                        width: "100%",
                        height: "auto",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        background: `hsl(${(col.title.charCodeAt(0) * 7) % 360}, 50%, 40%)`,
                      }}
                    />
                  )}
                  <div style={{ textAlign: "center", fontSize: 10, color: "#b0b0b0", fontStyle: "italic", padding: "2px 0" }}>
                    Recomendado: 400 x 400px
                  </div>
                  {showTitles && (
                    <div style={{ padding: "10px 4px 0", textAlign: "center" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>{col.title}</h3>
                      {col.productCount != null && (
                        <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "2px" }}>
                          {col.productCount} produtos
                        </p>
                      )}
                    </div>
                  )}
                </Link>
              );
            }

            // "contained" — historical fixed-height card with absolute image
            // fill and gradient overlay caption.
            return (
              <Link
                key={col.id}
                href={`/collections/${col.handle}`}
                className={enableHoverAnimation ? hoverClass : undefined}
                style={{
                  display: "block",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "12px",
                  height: "220px",
                  textDecoration: "none",
                  color: "#fff",
                }}
              >
                {col.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={col.image}
                    alt={col.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      transition: "transform 0.3s",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      background: `hsl(${(col.title.charCodeAt(0) * 7) % 360}, 50%, 40%)`,
                    }}
                  />
                )}
                <div style={{ position: "absolute", top: 4, left: 0, right: 0, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.7)", fontStyle: "italic", zIndex: 2, pointerEvents: "none" }}>
                  Recomendado: 400 x 220px
                </div>
                {showTitles && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "25px",
                      background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                    }}
                  >
                    <h3 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>{col.title}</h3>
                    {col.productCount != null && (
                      <p style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px" }}>
                        {col.productCount} produtos
                      </p>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
