interface SaleBannerProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  bgColor?: string;
  textColor?: string;
  discount?: string;
  backgroundImage?: string;
}

export default function SaleBanner({
  title,
  subtitle,
  ctaText = "Ver ofertas",
  ctaLink = "/collections/all",
  bgColor = "#1e2d7d",
  textColor = "#ffffff",
  discount,
  backgroundImage,
}: SaleBannerProps) {
  return (
    <div style={{
      background: backgroundImage
        ? `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${backgroundImage}) center/cover`
        : bgColor,
      color: textColor,
      padding: "48px 32px",
      borderRadius: 16,
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {discount && (
        <div style={{
          position: "absolute", top: 16, right: -28,
          background: "#dc2626", color: "#fff",
          padding: "6px 40px", fontSize: 14, fontWeight: 800,
          transform: "rotate(45deg)",
        }}>
          {discount}
        </div>
      )}

      <h2 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", textTransform: "uppercase" }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 16, opacity: 0.9, margin: "0 0 24px" }}>
          {subtitle}
        </p>
      )}
      <a
        href={ctaLink}
        style={{
          display: "inline-block",
          padding: "14px 36px",
          background: textColor,
          color: bgColor,
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 15,
          textDecoration: "none",
        }}
      >
        {ctaText} →
      </a>
      {backgroundImage && (
        <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
          Imagem de fundo recomendada: 1400 x 400px
        </div>
      )}
    </div>
  );
}
