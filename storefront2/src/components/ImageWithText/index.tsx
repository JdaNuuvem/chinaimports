import Link from "next/link";
import { useId } from "react";

interface ImageWithTextProps {
  image?: string;
  imagePosition?: "left" | "right";
  imageWidth?: number;
  title?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  /** Max-height in pixels for the image on desktop viewports. */
  imageHeight?: number;
  /** Max-height in pixels for the image on mobile viewports (<=640px). */
  imageHeightMobile?: number;
}

const DEFAULT_IMAGE_HEIGHT_DESKTOP = 450;
const DEFAULT_IMAGE_HEIGHT_MOBILE = 280;

export default function ImageWithText({
  image = "https://placehold.co/600x400/f5f5f5/333?text=Imports+China+Brasil",
  imagePosition = "left",
  imageWidth = 50,
  title = "Nossa História",
  content = "A Imports China Brasil é líder global em roupas, calçados e acessórios de performance esportiva. Fundada em 1996, nossa missão é tornar todos os atletas melhores.",
  buttonText = "Nossos produtos",
  buttonLink = "/collections/all",
  imageHeight,
  imageHeightMobile,
}: ImageWithTextProps) {
  const uid = useId().replace(/:/g, "-");
  const sizedClass = `image-with-text-img-${uid}`;
  const containerClass = `iwt-container-${uid}`;
  const imageWrapClass = `iwt-image-wrap-${uid}`;
  const textWrapClass = `iwt-text-wrap-${uid}`;
  const desktopH = imageHeight ?? DEFAULT_IMAGE_HEIGHT_DESKTOP;
  const mobileH = imageHeightMobile ?? desktopH;

  const imageEl = (
    <div className={imageWrapClass} style={{ width: `${imageWidth}%`, flexShrink: 0 }}>
      <img src={image} alt={title || ""} className={sizedClass} style={{ width: "100%", height: "auto", borderRadius: "8px", display: "block", objectFit: "cover" }} />
    </div>
  );

  const textEl = (
    <div className={textWrapClass} style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <div style={{ padding: "30px" }}>
        {title && <h2 className="heading h3" style={{ marginBottom: "15px" }}>{title}</h2>}
        {content && <div style={{ lineHeight: 1.7, marginBottom: "20px", color: "#666" }} dangerouslySetInnerHTML={{ __html: content }} />}
        {buttonText && buttonLink && (
          <Link href={buttonLink} className="button button--primary">{buttonText}</Link>
        )}
      </div>
    </div>
  );

  return (
    <section className="section" data-section-type="image-with-text">
      <style>{`
        .${sizedClass} { max-height: ${desktopH}px; }
        @media (max-width: 640px) {
          .${sizedClass} { max-height: ${mobileH}px; }
          .${containerClass} {
            flex-direction: column !important;
            align-items: center !important;
          }
          .${imageWrapClass} {
            width: 100% !important;
          }
          .${textWrapClass} {
            text-align: center;
          }
          .${textWrapClass} .heading {
            text-align: center;
          }
          .${textWrapClass} .button {
            display: inline-block;
          }
        }
      `}</style>
      <div className="container">
        <div className={containerClass} style={{ display: "flex", gap: "30px", alignItems: "center", flexWrap: "wrap" }}>
          {imagePosition === "left" ? <>{imageEl}{textEl}</> : <>{textEl}{imageEl}</>}
        </div>
      </div>
    </section>
  );
}
