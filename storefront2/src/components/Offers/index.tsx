import Link from "next/link";

interface Offer {
  id: string;
  title: string;
  description?: string;
  link?: string;
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
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${offers.length}, 1fr)`, gap: "15px" }}>
          {offers.map((offer) => (
            <Link key={offer.id} href={offer.link || "#"} style={{ display: "block", padding: "25px 30px", borderRadius: "10px", background: offer.backgroundColor, color: offer.textColor, textDecoration: "none", textAlign: "center", transition: "transform 0.2s" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "5px" }}>{offer.title}</h3>
              {offer.description && <p style={{ fontSize: "14px", opacity: 0.9 }}>{offer.description}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
