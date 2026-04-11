import Link from "next/link";
import { useId } from "react";

interface Offer {
  id: string;
  title: string;
  description?: string;
  link?: string;
  image?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface OffersProps {
  offers?: Offer[];
  /** Min-height in pixels for each offer tile on desktop viewports. */
  imageHeight?: number;
  /** Min-height in pixels for each offer tile on mobile viewports (<=640px). */
  imageHeightMobile?: number;
}

const DEFAULT_OFFERS: Offer[] = [
  { id: "1", title: "20% OFF na primeira compra", description: "Use o cupom: PRIMEIRA20", link: "/collections/all", backgroundColor: "#1e2d7d", textColor: "#fff" },
  { id: "2", title: "Frete Grátis acima de R$ 299", description: "Para todo o Brasil", link: "/collections/all", backgroundColor: "#e22120", textColor: "#fff" },
];

const DEFAULT_IMAGE_HEIGHT_DESKTOP = 220;
const DEFAULT_IMAGE_HEIGHT_MOBILE = 180;

export default function Offers({
  offers = DEFAULT_OFFERS,
  imageHeight,
  imageHeightMobile,
}: OffersProps) {
  const uid = useId().replace(/:/g, "-");
  const sizedClass = `offers-tile-${uid}`;
  const desktopH = imageHeight ?? DEFAULT_IMAGE_HEIGHT_DESKTOP;
  const mobileH = imageHeightMobile ?? desktopH;

  if (!offers || offers.length === 0) return null;
  return (
    <section className="section">
      <style>{`
        .${sizedClass} { min-height: ${desktopH}px; }
        .${sizedClass} .${sizedClass}__inner { min-height: ${desktopH}px; }
        @media (max-width: 640px) {
          .${sizedClass} { min-height: ${mobileH}px; }
          .${sizedClass} .${sizedClass}__inner { min-height: ${mobileH}px; }
        }
      `}</style>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${offers.length}, 1fr)`, gap: "15px" }}>
          {offers.map((offer) => {
            const hasImage = !!offer.image;
            return (
              <Link
                key={offer.id}
                href={offer.link || "#"}
                className={hasImage ? sizedClass : undefined}
                style={{
                  position: "relative",
                  display: "block",
                  borderRadius: "10px",
                  overflow: "hidden",
                  background: offer.backgroundColor,
                  color: offer.textColor,
                  textDecoration: "none",
                  textAlign: "center",
                  transition: "transform 0.2s",
                }}
              >
                {hasImage && (
                  <img
                    src={offer.image}
                    alt={offer.title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      zIndex: 0,
                    }}
                  />
                )}
                {hasImage && (
                  // Overlay sutil para garantir leitura do texto sobre a imagem.
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.55))",
                      zIndex: 1,
                    }}
                  />
                )}
                <div
                  className={hasImage ? `${sizedClass}__inner` : undefined}
                  style={{
                    position: "relative",
                    zIndex: 2,
                    padding: "25px 30px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "5px" }}>{offer.title}</h3>
                  {offer.description && <p style={{ fontSize: "14px", opacity: 0.9 }}>{offer.description}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
