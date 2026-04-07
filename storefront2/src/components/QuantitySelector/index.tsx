"use client";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { height: 28, font: 12, icon: 10, width: 80 },
  md: { height: 36, font: 14, icon: 12, width: 100 },
  lg: { height: 44, font: 16, icon: 14, width: 120 },
};

export default function QuantitySelector({ value, onChange, min = 1, max = 99, size = "md" }: QuantitySelectorProps) {
  const s = SIZES[size];

  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      border: "1px solid var(--border-color, #d1d5db)",
      borderRadius: 6, overflow: "hidden",
      height: s.height,
    }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{
          width: s.height, height: s.height,
          border: "none", background: "none",
          cursor: value <= min ? "not-allowed" : "pointer",
          color: value <= min ? "#d1d5db" : "#374151",
          fontSize: s.icon, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value) || min;
          onChange(Math.min(max, Math.max(min, v)));
        }}
        min={min}
        max={max}
        style={{
          width: s.width - s.height * 2,
          height: s.height,
          border: "none",
          borderLeft: "1px solid var(--border-color, #d1d5db)",
          borderRight: "1px solid var(--border-color, #d1d5db)",
          textAlign: "center",
          fontSize: s.font,
          fontWeight: 600,
          outline: "none",
          appearance: "textfield",
          MozAppearance: "textfield",
        }}
      />
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{
          width: s.height, height: s.height,
          border: "none", background: "none",
          cursor: value >= max ? "not-allowed" : "pointer",
          color: value >= max ? "#d1d5db" : "#374151",
          fontSize: s.icon, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        +
      </button>
    </div>
  );
}
