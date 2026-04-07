"use client";

interface ColorSwatchesProps {
  colors: Array<{ name: string; hex: string; variantId?: string }>;
  selectedColor?: string;
  onSelect: (colorName: string) => void;
  size?: number;
}

const COLOR_MAP: Record<string, string> = {
  preto: "#000000",
  branco: "#FFFFFF",
  azul: "#1e3a8a",
  "azul marinho": "#1e3a5f",
  "azul royal": "#2563eb",
  vermelho: "#dc2626",
  cinza: "#6b7280",
  "cinza claro": "#d1d5db",
  "cinza escuro": "#374151",
  verde: "#16a34a",
  "verde militar": "#4d7c0f",
  rosa: "#A53954",
  laranja: "#f97316",
  amarelo: "#eab308",
  roxo: "#7c3aed",
  marrom: "#92400e",
  bege: "#d4b896",
  coral: "#f87171",
  nude: "#e8c4a2",
  vinho: "#7f1d1d",
  cáqui: "#a3916a",
  grafite: "#3f3f46",
};

function getColorHex(name: string): string {
  const lower = name.toLowerCase();
  return COLOR_MAP[lower] || "#9ca3af";
}

export default function ColorSwatches({ colors, selectedColor, onSelect, size = 28 }: ColorSwatchesProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {colors.map((color) => {
        const hex = color.hex || getColorHex(color.name);
        const isSelected = selectedColor?.toLowerCase() === color.name.toLowerCase();
        const isLight = hex === "#FFFFFF" || hex === "#ffffff";

        return (
          <button
            key={color.name}
            onClick={() => onSelect(color.name)}
            title={color.name}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: hex,
              border: isSelected
                ? `3px solid var(--primary-color, #1e2d7d)`
                : isLight
                  ? "2px solid #d1d5db"
                  : "2px solid transparent",
              cursor: "pointer",
              outline: isSelected ? "2px solid #fff" : "none",
              outlineOffset: -5,
              position: "relative",
              transition: "transform 0.15s, border 0.15s",
              transform: isSelected ? "scale(1.15)" : "scale(1)",
              boxShadow: isSelected ? "0 0 0 2px rgba(30,45,125,0.3)" : "none",
            }}
          >
            {/* Tooltip */}
            <span style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#1f2937",
              color: "#fff",
              padding: "3px 8px",
              borderRadius: 4,
              fontSize: 10,
              whiteSpace: "nowrap",
              opacity: 0,
              pointerEvents: "none",
              transition: "opacity 0.2s",
            }}>
              {color.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { getColorHex };
