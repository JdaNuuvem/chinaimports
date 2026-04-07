"use client";

interface PromoMarqueeProps {
  items?: string[];
  speed?: number; // seconds for one full loop
  bgColor?: string;
  textColor?: string;
}

const DEFAULT_ITEMS = [
  "🔥 FRETE GRÁTIS acima de R$ 299",
  "💳 Parcele em até 10x sem juros",
  "↩️ Troca grátis em 30 dias",
  "🏷️ Use o cupom BEMVINDO10 e ganhe 10% OFF",
  "🚚 Entrega para todo o Brasil",
];

export default function PromoMarquee({
  items = DEFAULT_ITEMS,
  speed = 30,
  bgColor = "#1e2d7d",
  textColor = "#ffffff",
}: PromoMarqueeProps) {
  const content = items.join("   •   ");

  return (
    <div style={{
      background: bgColor,
      color: textColor,
      overflow: "hidden",
      whiteSpace: "nowrap",
      padding: "6px 0",
      fontSize: 12,
      fontWeight: 500,
    }}>
      <div style={{
        display: "inline-block",
        animation: `marquee ${speed}s linear infinite`,
        paddingLeft: "100%",
      }}>
        {content}   •   {content}
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`,
      }} />
    </div>
  );
}
