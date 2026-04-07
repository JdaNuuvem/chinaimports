"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Slide {
  id: string;
  image: string;
  mobileImage?: string;
  title?: string;
  content?: string;
  buttonText?: string;
  link?: string;
  textColor?: string;
  buttonBackground?: string;
  buttonTextColor?: string;
  contentPosition?: string;
  // When true, forces image-only mode — title/content/buttonText are ignored
  // even if filled in. Useful for banners that have the call-to-action baked
  // into the image itself.
  imageOnly?: boolean;
  // When false, hides the action button even if buttonText/link are filled.
  // Default: true (show button when buttonText + link are present).
  showButton?: boolean;
}

interface SlideshowProps {
  slides?: Slide[];
  autoPlay?: boolean;
  cycleSpeed?: number;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "1",
    image: "https://placehold.co/1800x600/1e2d7d/ffffff?text=IMPORTS+CHINA+BRASIL",
    mobileImage: "https://placehold.co/750x1100/1e2d7d/ffffff?text=ICB",
    title: "Nova Coleção",
    content: "Performance que te leva além",
    buttonText: "Comprar Agora",
    link: "/collections/all",
    textColor: "#ffffff",
    buttonBackground: "#ffffff",
    buttonTextColor: "#1e2d7d",
    contentPosition: "middle_center",
  },
  {
    id: "2",
    image: "https://placehold.co/1800x600/e22120/ffffff?text=OUTLET+50%25+OFF",
    mobileImage: "https://placehold.co/750x1100/e22120/ffffff?text=OUTLET",
    title: "Outlet",
    content: "Até 50% de desconto",
    buttonText: "Ver Ofertas",
    link: "/collections/outlet",
    textColor: "#ffffff",
    buttonBackground: "#ffffff",
    buttonTextColor: "#e22120",
    contentPosition: "middle_center",
  },
];

export default function Slideshow({ slides = DEFAULT_SLIDES, autoPlay = true, cycleSpeed = 5000 }: SlideshowProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const timer = setInterval(next, cycleSpeed);
    return () => clearInterval(timer);
  }, [autoPlay, cycleSpeed, next, slides.length]);

  return (
    <section className="slideshow-section" data-section-type="slideshow">
      <div className="slideshow slideshow--preserve-ratio">
        {slides.map((slide, index) => (
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
                      className="slideshow__image"
                      style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: "500px" }}
                    />
                  </picture>
                );
                // In image-only mode, wrap whole image in a link if available
                if (slide.imageOnly && slide.link) {
                  return (
                    <Link href={slide.link} aria-label={slide.title || "Banner"} style={{ display: "block" }}>
                      {imageEl}
                    </Link>
                  );
                }
                return imageEl;
              })()}

              {!slide.imageOnly && (slide.title || slide.content || slide.buttonText) && (
                <div className="slideshow__content-wrapper" style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}>
                  <div className="container">
                    {slide.title && <h2 className="slideshow__title heading h1">{slide.title}</h2>}
                    {slide.content && <p className="slideshow__content">{slide.content}</p>}
                    {slide.showButton !== false && slide.link && slide.buttonText && (
                      <Link
                        href={slide.link}
                        className="slideshow__button button cta-pulse-primary"
                        style={{ background: slide.buttonBackground, color: slide.buttonTextColor }}
                      >
                        {slide.buttonText}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="slideshow__dots" style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "15px 0" }}>
            {slides.map((_, index) => (
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
