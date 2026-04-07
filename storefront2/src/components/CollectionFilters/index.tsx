"use client";

import { useState } from "react";

interface FiltersState {
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  sortBy: string;
}

interface CollectionFiltersProps {
  availableSizes?: string[];
  availableColors?: string[];
  onFilterChange: (filters: FiltersState) => void;
  initialSort?: string;
}

const DEFAULT_SIZES = ["PP", "P", "M", "G", "GG", "XG", "36", "37", "38", "39", "40", "41", "42", "43", "44"];
const DEFAULT_COLORS = [
  { name: "Preto", hex: "#000000" },
  { name: "Branco", hex: "#FFFFFF" },
  { name: "Azul", hex: "#1e3a8a" },
  { name: "Vermelho", hex: "#dc2626" },
  { name: "Cinza", hex: "#6b7280" },
  { name: "Verde", hex: "#16a34a" },
  { name: "Rosa", hex: "#A53954" },
  { name: "Laranja", hex: "#f97316" },
];

export default function CollectionFilters({ availableSizes, availableColors, onFilterChange, initialSort = "relevance" }: CollectionFiltersProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    priceRange: [0, 100000],
    sizes: [],
    colors: [],
    sortBy: initialSort,
  });

  const sizes = availableSizes || DEFAULT_SIZES;
  const colors = availableColors || DEFAULT_COLORS.map((c) => c.name);

  const update = (partial: Partial<FiltersState>) => {
    const next = { ...filters, ...partial };
    setFilters(next);
    onFilterChange(next);
  };

  const toggleSize = (size: string) => {
    const next = filters.sizes.includes(size) ? filters.sizes.filter((s) => s !== size) : [...filters.sizes, size];
    update({ sizes: next });
  };

  const toggleColor = (color: string) => {
    const next = filters.colors.includes(color) ? filters.colors.filter((c) => c !== color) : [...filters.colors, color];
    update({ colors: next });
  };

  const clearAll = () => {
    const reset: FiltersState = { priceRange: [0, 100000], sizes: [], colors: [], sortBy: filters.sortBy };
    setFilters(reset);
    onFilterChange(reset);
  };

  const activeCount = filters.sizes.length + filters.colors.length + (filters.priceRange[1] < 100000 ? 1 : 0);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", border: "1px solid var(--border-color, #e1e3e5)",
            borderRadius: 8, background: open ? "#f0f0f0" : "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}
        >
          <span>Filtros</span>
          {activeCount > 0 && (
            <span style={{ background: "var(--primary-color, #1e2d7d)", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
              {activeCount}
            </span>
          )}
        </button>

        <select
          value={filters.sortBy}
          onChange={(e) => update({ sortBy: e.target.value })}
          style={{ padding: "10px 14px", border: "1px solid var(--border-color, #e1e3e5)", borderRadius: 8, fontSize: 13, background: "#fff", cursor: "pointer" }}
        >
          <option value="relevance">Relevância</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="newest">Mais recentes</option>
          <option value="name-asc">A-Z</option>
          <option value="name-desc">Z-A</option>
        </select>
      </div>

      {open && (
        <div style={{ marginTop: 16, padding: 20, border: "1px solid var(--border-color, #e1e3e5)", borderRadius: 12, background: "#fff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {/* Price */}
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Faixa de preço</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange[0] > 0 ? filters.priceRange[0] / 100 : ""}
                  onChange={(e) => update({ priceRange: [Number(e.target.value) * 100 || 0, filters.priceRange[1]] })}
                  style={{ width: 80, padding: "8px 10px", border: "1px solid #e1e3e5", borderRadius: 6, fontSize: 13 }}
                />
                <span style={{ color: "#9ca3af" }}>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange[1] < 100000 ? filters.priceRange[1] / 100 : ""}
                  onChange={(e) => update({ priceRange: [filters.priceRange[0], Number(e.target.value) * 100 || 100000] })}
                  style={{ width: 80, padding: "8px 10px", border: "1px solid #e1e3e5", borderRadius: 6, fontSize: 13 }}
                />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Tamanho</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {sizes.slice(0, 12).map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    style={{
                      padding: "6px 10px", fontSize: 12, border: "1px solid", borderRadius: 6, cursor: "pointer",
                      borderColor: filters.sizes.includes(size) ? "var(--primary-color, #1e2d7d)" : "#e1e3e5",
                      background: filters.sizes.includes(size) ? "var(--primary-color, #1e2d7d)" : "#fff",
                      color: filters.sizes.includes(size) ? "#fff" : "#333",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Cor</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => toggleColor(color.name)}
                    title={color.name}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", cursor: "pointer",
                      background: color.hex,
                      border: filters.colors.includes(color.name) ? "3px solid var(--primary-color, #1e2d7d)" : "2px solid #e1e3e5",
                      outline: filters.colors.includes(color.name) ? "2px solid #fff" : "none",
                      outlineOffset: -4,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {activeCount > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>{activeCount} filtro(s) ativo(s)</span>
              <button onClick={clearAll} style={{ fontSize: 13, color: "#e53e3e", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
