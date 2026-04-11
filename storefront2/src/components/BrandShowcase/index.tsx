"use client";
import { useId } from "react";

interface BrandItem {
  name: string;
  logoUrl: string;
  link?: string;
}

interface BrandShowcaseProps {
  title?: string;
  brands: BrandItem[];
  /** Max-height in pixels for each brand logo on desktop viewports. */
  imageHeight?: number;
  /** Max-height in pixels for each brand logo on mobile viewports (<=640px). */
  imageHeightMobile?: number;
}

const DEFAULT_IMAGE_HEIGHT_DESKTOP = 60;
const DEFAULT_IMAGE_HEIGHT_MOBILE = 48;

export default function BrandShowcase({
  title = "Marcas",
  brands,
  imageHeight,
  imageHeightMobile,
}: BrandShowcaseProps) {
  const uid = useId().replace(/:/g, "-");
  const sizedClass = `brand-showcase-logo-${uid}`;
  const desktopH = imageHeight ?? DEFAULT_IMAGE_HEIGHT_DESKTOP;
  const mobileH = imageHeightMobile ?? desktopH;
  // max-width scales proportionally with the height so the logos stay
  // balanced when the user bumps the height.
  const desktopW = Math.round(desktopH * 2.3);
  const mobileW = Math.round(mobileH * 2.3);

  if (brands.length === 0) return null;

  return (
    <div className="section">
      <style>{`
        .${sizedClass} { max-height: ${desktopH}px; max-width: ${desktopW}px; }
        @media (max-width: 640px) {
          .${sizedClass} { max-height: ${mobileH}px; max-width: ${mobileW}px; }
        }
      `}</style>
      <div className="container">
        {title && (
          <div className="section__header">
            <h2 className="section__title heading h3">{title}</h2>
          </div>
        )}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 30,
          justifyContent: "center",
          alignItems: "center",
        }}>
          {brands.map((brand, i) => {
            const content = (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className={sizedClass}
                style={{ objectFit: "contain", filter: "grayscale(100%)", transition: "filter 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "grayscale(0%)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "grayscale(100%)")}
              />
            );

            return brand.link ? (
              <a key={i} href={brand.link} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center" }}>
                {content}
              </a>
            ) : (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
