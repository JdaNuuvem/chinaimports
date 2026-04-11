import Link from "next/link";

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
}

const DEFAULT_OFFERS: Offer[] = [
  { id: "1", title: "20% OFF na primeira compra", description: "Use o cupom: PRIMEIRA20", link: "/collections/all", backgroundColor: "#1e2d7d", textColor: "#fff" },
  { id: "2", title: "Frete Grátis acima de R$ 299", description: "Para todo o Brasil", link: "/collections/all", backgroundColor: "#e22120", textColor: "#fff" },
];

export default function Offers({ offers = DEFAULT_OFFERS }: OffersProps) {
  if (!offers || offers.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${offers.length}, 1fr)`, gap: "15px" }}>
          {offers.map((offer) => {
            const hasImage = !!offer.image;
            return (
              <Link
                key={offer.id}
                href={offer.link || "#"}
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
                  minHeight: hasImage ? 220 : undefined,
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
                  style={{
                    position: "relative",
                    zIndex: 2,
                    padding: "25px 30px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    minHeight: hasImage ? 220 : undefined,
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
