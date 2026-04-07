"use client";

interface SizeSelectorProps {
  sizes: Array<{ value: string; available: boolean }>;
  selected: string;
  onChange: (size: string) => void;
}

export default function SizeSelector({ sizes, selected, onChange }: SizeSelectorProps) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {sizes.map((size) => (
        <button
          key={size.value}
          onClick={() => size.available && onChange(size.value)}
          disabled={!size.available}
          style={{
            minWidth: 44, height: 40,
            padding: "0 12px",
            borderRadius: 6,
            border: `2px solid ${
              selected === size.value
                ? "var(--primary-color, #1e2d7d)"
                : size.available
                  ? "#d1d5db"
                  : "#f0f0f0"
            }`,
            background: selected === size.value
              ? "var(--primary-color, #1e2d7d)"
              : size.available
                ? "#fff"
                : "#f9fafb",
            color: selected === size.value
              ? "#fff"
              : size.available
                ? "#374151"
                : "#d1d5db",
            fontSize: 13,
            fontWeight: selected === size.value ? 700 : 500,
            cursor: size.available ? "pointer" : "not-allowed",
            position: "relative",
            transition: "all 0.15s",
          }}
        >
          {size.value}
          {!size.available && (
            <div style={{
              position: "absolute", top: "50%", left: "10%", right: "10%",
              height: 1, background: "#d1d5db",
              transform: "rotate(-45deg)",
            }} />
          )}
        </button>
      ))}
    </div>
  );
}
