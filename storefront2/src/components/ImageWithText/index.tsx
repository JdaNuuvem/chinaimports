import Link from "next/link";

interface ImageWithTextProps {
  image?: string;
  imagePosition?: "left" | "right";
  imageWidth?: number;
  title?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function ImageWithText({
  image = "https://placehold.co/600x400/f5f5f5/333?text=Imports+China+Brasil",
  imagePosition = "left",
  imageWidth = 50,
  title = "Nossa História",
  content = "A Imports China Brasil é líder global em roupas, calçados e acessórios de performance esportiva. Fundada em 1996, nossa missão é tornar todos os atletas melhores.",
  buttonText = "Nossos produtos",
  buttonLink = "/collections/all",
}: ImageWithTextProps) {
  const imageEl = (
    <div style={{ width: `${imageWidth}%`, flexShrink: 0 }}>
      <img src={image} alt={title || ""} style={{ width: "100%", height: "auto", borderRadius: "8px", display: "block" }} />
    </div>
  );

  const textEl = (
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
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
      <div className="container">
        <div style={{ display: "flex", gap: "30px", alignItems: "center", flexWrap: "wrap" }}>
          {imagePosition === "left" ? <>{imageEl}{textEl}</> : <>{textEl}{imageEl}</>}
        </div>
      </div>
    </section>
  );
}
