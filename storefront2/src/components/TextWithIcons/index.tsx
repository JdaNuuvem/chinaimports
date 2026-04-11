import { useId } from "react";

interface TextWithIconItem {
  /** Emoji or short text used when no `iconImage` is provided. */
  icon: string;
  /** Optional uploaded image. When set, replaces the emoji icon. */
  iconImage?: string;
  title: string;
  content?: string;
}

interface TextWithIconsProps {
  items?: TextWithIconItem[];
  /** Size in pixels (width and height) for the icon image on desktop. */
  imageHeight?: number;
  /** Size in pixels (width and height) for the icon image on mobile (<=640px). */
  imageHeightMobile?: number;
}

const DEFAULT_ITEMS: TextWithIconItem[] = [
  { icon: "🚚", title: "Frete Grátis", content: "Acima de R$ 299" },
  { icon: "↩️", title: "Troca Grátis", content: "Até 30 dias" },
  { icon: "🔒", title: "Compra Segura", content: "Ambiente protegido" },
  { icon: "💳", title: "Parcele em 6x", content: "Sem juros" },
];

const DEFAULT_IMAGE_HEIGHT_DESKTOP = 36;
const DEFAULT_IMAGE_HEIGHT_MOBILE = 28;

export default function TextWithIcons({
  items = DEFAULT_ITEMS,
  imageHeight,
  imageHeightMobile,
}: TextWithIconsProps) {
  const uid = useId().replace(/:/g, "-");
  const sizedClass = `text-with-icons-icon-${uid}`;
  const desktopH = imageHeight ?? DEFAULT_IMAGE_HEIGHT_DESKTOP;
  const mobileH = imageHeightMobile ?? desktopH;

  return (
    <section className="section section--tight" data-section-type="text-with-icons" style={{ borderTop: "1px solid var(--border-color, #e0e0e0)", borderBottom: "1px solid var(--border-color, #e0e0e0)", padding: "20px 0" }}>
      <style>{`
        .${sizedClass} { width: ${desktopH}px; height: ${desktopH}px; }
        @media (max-width: 640px) {
          .${sizedClass} { width: ${mobileH}px; height: ${mobileH}px; }
        }
      `}</style>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px" }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0" }}>
              {item.iconImage ? (
                <img
                  src={item.iconImage}
                  alt={item.title}
                  className={sizedClass}
                  style={{ objectFit: "contain", flexShrink: 0 }}
                />
              ) : (
                <span style={{ fontSize: "28px" }}>{item.icon}</span>
              )}
              <div>
                <p style={{ fontWeight: 600, fontSize: "14px", margin: 0 }}>{item.title}</p>
                {item.content && <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>{item.content}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
