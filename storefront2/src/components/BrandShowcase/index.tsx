interface BrandItem {
  name: string;
  logoUrl: string;
  link?: string;
}

interface BrandShowcaseProps {
  title?: string;
  brands: BrandItem[];
}

export default function BrandShowcase({ title = "Marcas", brands }: BrandShowcaseProps) {
  if (brands.length === 0) return null;

  return (
    <div className="section">
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
                style={{ maxHeight: 60, maxWidth: 140, objectFit: "contain", filter: "grayscale(100%)", transition: "filter 0.3s" }}
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
