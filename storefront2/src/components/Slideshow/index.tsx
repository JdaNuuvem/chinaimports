"use client";
import { useState, useEffect, useCallback, useId } from "react";
import Link from "next/link";

interface Slide {
  id: string;
  image: string;
  mobileImage?: string;
  title?: string;
  content?: string;
  link?: string;
  textColor?: string;
  contentPosition?: string;
  // When true, hides title/content overlay. The whole banner is still
  // clickable if `link` is set.
  imageOnly?: boolean;
}

interface SlideshowProps {
  slides?: Slide[];
  autoPlay?: boolean;
  cycleSpeed?: number;
  /** Max-height in pixels for the slide image on desktop viewports. */
  imageHeight?: number;
  /**
   * Max-height in pixels for the slide image on mobile viewports
   * (viewport <= 640px). When omitted, falls back to `imageHeight`.
   */
  imageHeightMobile?: number;
}

const DEFAULT_IMAGE_HEIGHT_DESKTOP = 500;
const DEFAULT_IMAGE_HEIGHT_MOBILE = 300;

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "1",
    image: "https://placehold.co/1800x600/1e2d7d/ffffff?text=IMPORTS+CHINA+BRASIL",
    mobileImage: "https://placehold.co/750x1100/1e2d7d/ffffff?text=ICB",
    title: "Nova Coleção",
    content: "Performance que te leva além",
    link: "/collections/all",
    textColor: "#ffffff",
    contentPosition: "middle_center",
  },
  {
    id: "2",
    image: "https://placehold.co/1800x600/e22120/ffffff?text=OUTLET+50%25+OFF",
    mobileImage: "https://placehold.co/750x1100/e22120/ffffff?text=OUTLET",
    title: "Outlet",
    content: "Até 50% de desconto",
    link: "/collections/outlet",
    textColor: "#ffffff",
    contentPosition: "middle_center",
  },
];

export default function Slideshow({
  slides,
  autoPlay = true,
  cycleSpeed = 5000,
  imageHeight,
  imageHeightMobile,
}: SlideshowProps) {
  // Quando o admin não configurou nenhum slide, NÃO renderizar
  // os placeholders — caso contrário o usuário "remove tudo" no
  // editor mas continua vendo banners fantasmas na home.
  const effectiveSlides = slides && slides.length > 0 ? slides : [];
  const [current, setCurrent] = useState(0);

  // Per-instance class name so two slideshows on the same page can have
  // independent heights without CSS collision. useId is SSR-safe.
  const uid = useId().replace(/:/g, "-");
  const sizedClass = `slideshow-img-${uid}`;
  const desktopH = imageHeight ?? DEFAULT_IMAGE_HEIGHT_DESKTOP;
  const mobileH = imageHeightMobile ?? desktopH;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % Math.max(effectiveSlides.length, 1));
  }, [effectiveSlides.length]);

  useEffect(() => {
    if (!autoPlay || effectiveSlides.length <= 1) return;
    const timer = setInterval(next, cycleSpeed);
    return () => clearInterval(timer);
  }, [autoPlay, cycleSpeed, next, effectiveSlides.length]);

  if (effectiveSlides.length === 0) return null;

  return (
    <section className="slideshow-section" data-section-type="slideshow" style={{ margin: 0, padding: 0 }}>
      <style>{`
        .${sizedClass} { max-height: ${desktopH}px; }
        @media (max-width: 640px) {
          .${sizedClass} { max-height: ${mobileH}px; }
        }
      `}</style>
      <div className="slideshow slideshow--preserve-ratio slideshow--edge2edge">
        {effectiveSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slideshow__slide ${index === current ? "is-selected" : ""}`}
            style={{ color: slide.textColor, display: index === current ? "block" : "none" }}
          >
            <div className={`slideshow__slide-inner slideshow__slide-inner--${(slide.contentPosition || "middle_center").replace("_", "-")}`}>
              {(() => {
                const imageEl = (
                  <picture>
                    {slide.mobileImage && (
                      <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
                    )}
                    <img
                      src={slide.image}
                      alt={slide.title || "Slide"}
                      className={`slideshow__image ${sizedClass}`}
                      style={{ width: "100%", display: "block", objectFit: "cover" }}
                    />
                  </picture>
                );
                // If a link is set, the entire banner is clickable.
                if (slide.link) {
                  return (
                    <Link href={slide.link} aria-label={slide.title || "Banner"} style={{ display: "block" }}>
                      {imageEl}
                    </Link>
                  );
                }
                return imageEl;
              })()}
            </div>
          </div>
        ))}

        {/* Dots */}
        {effectiveSlides.length > 1 && (
          <div className="slideshow__dots" style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "15px 0" }}>
            {effectiveSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`slideshow__dot ${index === current ? "is-selected" : ""}`}
                style={{
                  width: 12, height: 12,
                  borderRadius: "50%",
                  border: "2px solid var(--accent-color, #1e2d7d)",
                  background: index === current ? "var(--accent-color, #1e2d7d)" : "transparent",
                  cursor: "pointer",
                }}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
