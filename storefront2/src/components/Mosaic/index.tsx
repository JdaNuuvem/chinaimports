import Link from "next/link";

interface MosaicItem {
  id: string;
  image?: string;
  title?: string;
  content?: string;
  buttonText?: string;
  link?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonBackground?: string;
  buttonTextColor?: string;
}

interface MosaicProps {
  items?: MosaicItem[];
  sectionSize?: "small" | "medium" | "large";
}

const DEFAULT_ITEMS: MosaicItem[] = [
  { id: "1", image: "https://placehold.co/800x520/1e2d7d/fff?text=Masculino", title: "Masculino", buttonText: "Ver coleção", link: "/collections/masculino", textColor: "#fff" },
  { id: "2", image: "https://placehold.co/800x520/e22120/fff?text=Feminino", title: "Feminino", buttonText: "Ver coleção", link: "/collections/feminino", textColor: "#fff" },
  { id: "3", image: "https://placehold.co/800x520/333/fff?text=Outlet", title: "Outlet", buttonText: "Ver ofertas", link: "/collections/outlet", textColor: "#fff" },
];

export default function Mosaic({ items = DEFAULT_ITEMS, sectionSize = "medium" }: MosaicProps) {
  return (
    <section className="section" data-section-type="mosaic">
      <div className="container">
        <div className={`mosaic mosaic--${sectionSize}`} style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: "10px" }}>
          {items.map((item) => (
            <div key={item.id} className="mosaic__item">
              <Link
                href={item.link || "#"}
                className="promo-block promo-block--middle-center"
                style={{
                  display: "block",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: item.backgroundColor || "#f3f4f4",
                  color: item.textColor || "#4f5558",
                  borderRadius: "8px",
                }}
              >
                {item.image && (
                  <div className="promo-block__image-clip">
                    <img
                      src={item.image}
                      alt={item.title || ""}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                )}
                <div className="promo-block__inner" style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
                  textAlign: "center",
                }}>
                  {item.title && <p className="promo-block__heading heading h3">{item.title}</p>}
                  {item.content && <p className="promo-block__content">{item.content}</p>}
                  {item.buttonText && (
                    <span className="promo-block__cta button button--floating cta-pulse-primary" style={{
                      background: item.buttonBackground || "#fff",
                      color: item.buttonTextColor || "#333",
                      marginTop: "15px",
                    }}>
                      {item.buttonText}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
