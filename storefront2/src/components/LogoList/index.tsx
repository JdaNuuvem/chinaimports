import Link from "next/link";
import { useId } from "react";

interface LogoItem {
  id: string;
  image: string;
  alt?: string;
  link?: string;
}

interface LogoListProps {
  title?: string;
  logos?: LogoItem[];
  /** Max-height in pixels for each logo on desktop viewports. */
  imageHeight?: number;
  /** Max-height in pixels for each logo on mobile viewports (<=640px). */
  imageHeightMobile?: number;
}

const DEFAULT_LOGOS: LogoItem[] = [
  { id: "1", image: "https://placehold.co/140x70/f5f5f5/999?text=Brand+1", alt: "Brand 1" },
  { id: "2", image: "https://placehold.co/140x70/f5f5f5/999?text=Brand+2", alt: "Brand 2" },
  { id: "3", image: "https://placehold.co/140x70/f5f5f5/999?text=Brand+3", alt: "Brand 3" },
  { id: "4", image: "https://placehold.co/140x70/f5f5f5/999?text=Brand+4", alt: "Brand 4" },
  { id: "5", image: "https://placehold.co/140x70/f5f5f5/999?text=Brand+5", alt: "Brand 5" },
];

const DEFAULT_IMAGE_HEIGHT_DESKTOP = 70;
const DEFAULT_IMAGE_HEIGHT_MOBILE = 52;

export default function LogoList({
  title = "Parceiros",
  logos = DEFAULT_LOGOS,
  imageHeight,
  imageHeightMobile,
}: LogoListProps) {
  const uid = useId().replace(/:/g, "-");
  const sizedClass = `logo-list-item-${uid}`;
  const desktopH = imageHeight ?? DEFAULT_IMAGE_HEIGHT_DESKTOP;
  const mobileH = imageHeightMobile ?? desktopH;
  // Width scales proportionally to height to keep logo aspect ratio balanced.
  const desktopW = Math.round(desktopH * 2);
  const mobileW = Math.round(mobileH * 2);

  return (
    <section className="section" data-section-type="logo-list">
      <style>{`
        .${sizedClass} { max-width: ${desktopW}px; max-height: ${desktopH}px; }
        @media (max-width: 640px) {
          .${sizedClass} { max-width: ${mobileW}px; max-height: ${mobileH}px; }
        }
      `}</style>
      <div className="container">
        {title && (
          <header className="section__header" style={{ justifyContent: "center" }}>
            <h2 className="section__title heading h3">{title}</h2>
          </header>
        )}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "30px" }}>
          {logos.map((logo) => (
            <div key={logo.id}>
              {logo.link ? (
                <Link href={logo.link}><img src={logo.image} alt={logo.alt || ""} className={sizedClass} style={{ objectFit: "contain", filter: "grayscale(100%)", opacity: 0.6, transition: "all 0.3s" }} /></Link>
              ) : (
                <img src={logo.image} alt={logo.alt || ""} className={sizedClass} style={{ objectFit: "contain", filter: "grayscale(100%)", opacity: 0.6, transition: "all 0.3s" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
