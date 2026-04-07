interface ProductBadgesProps {
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  discount?: number; // percentage
  freeShipping?: boolean;
}

export default function ProductBadges({ isNew, isBestSeller, isFeatured, discount, freeShipping }: ProductBadgesProps) {
  const badges: Array<{ label: string; bg: string; color: string }> = [];

  if (discount && discount > 0) badges.push({ label: `${discount}% OFF`, bg: "#dc2626", color: "#fff" });
  if (isNew) badges.push({ label: "Novo", bg: "#2563eb", color: "#fff" });
  if (isBestSeller) badges.push({ label: "Mais vendido", bg: "#f59e0b", color: "#000" });
  if (isFeatured) badges.push({ label: "Destaque", bg: "#7c3aed", color: "#fff" });
  if (freeShipping) badges.push({ label: "Frete grátis", bg: "#16a34a", color: "#fff" });

  if (badges.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {badges.map((b) => (
        <span key={b.label} style={{
          padding: "3px 8px", borderRadius: 4,
          fontSize: 10, fontWeight: 700,
          background: b.bg, color: b.color,
          textTransform: "uppercase", letterSpacing: 0.5,
        }}>
          {b.label}
        </span>
      ))}
    </div>
  );
}
