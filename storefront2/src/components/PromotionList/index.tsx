import Link from "next/link";

interface PromoBlock {
  id: string;
  image?: string;
  title?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonBackground?: string;
  buttonTextColor?: string;
}

interface PromotionListProps {
  blocks?: PromoBlock[];
  sectionSize?: "small" | "medium" | "large";
}

const DEFAULT_BLOCKS: PromoBlock[] = [
  { id: "1", image: "https://placehold.co/600x400/1e2d7d/fff?text=Treino", title: "Treino", buttonText: "Comprar", buttonLink: "/collections/treino", textColor: "#fff" },
  { id: "2", image: "https://placehold.co/600x400/e22120/fff?text=Corrida", title: "Corrida", buttonText: "Comprar", buttonLink: "/collections/corrida", textColor: "#fff" },
  { id: "3", image: "https://placehold.co/600x400/333/fff?text=Casual", title: "Casual", buttonText: "Comprar", buttonLink: "/collections/casual", textColor: "#fff" },
];

export default function PromotionList({ blocks = DEFAULT_BLOCKS, sectionSize = "medium" }: PromotionListProps) {
  const heights = { small: "250px", medium: "350px", large: "450px" };
  return (
    <section className="section" data-section-type="promo-block">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(blocks.length, 3)}, 1fr)`, gap: "15px" }}>
          {blocks.map((block) => (
            <Link key={block.id} href={block.buttonLink || "#"} style={{ display: "block", position: "relative", overflow: "hidden", borderRadius: "8px", height: heights[sectionSize], backgroundColor: block.backgroundColor || "#f3f4f4", color: block.textColor || "#333", textDecoration: "none" }}>
              {block.image && <img src={block.image} alt={block.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />}
              <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
                {block.title && <p style={{ fontSize: "24px", fontWeight: 700, marginBottom: "10px" }}>{block.title}</p>}
                {block.content && <p style={{ marginBottom: "15px" }}>{block.content}</p>}
                {block.buttonText && <span className="button button--primary" style={{ background: block.buttonBackground || "#fff", color: block.buttonTextColor || "#333" }}>{block.buttonText}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
