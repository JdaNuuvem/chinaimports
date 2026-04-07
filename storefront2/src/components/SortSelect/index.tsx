"use client";

interface SortSelectProps {
  currentSort?: string;
}

export default function SortSelect({ currentSort }: SortSelectProps) {
  return (
    <form method="GET" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <label htmlFor="sort" style={{ fontSize: 14, fontWeight: 600 }}>Ordenar por:</label>
      <select
        id="sort"
        name="sort"
        defaultValue={currentSort || ""}
        onChange={(e) => {
          const url = new URL(window.location.href);
          url.searchParams.set("sort", e.target.value);
          url.searchParams.delete("page");
          window.location.href = url.toString();
        }}
        style={{ padding: "8px 12px", border: "1px solid var(--border-color)", borderRadius: 4, fontSize: 14 }}
      >
        <option value="">Relevância</option>
        <option value="price_asc">Menor preço</option>
        <option value="price_desc">Maior preço</option>
        <option value="title_asc">A-Z</option>
        <option value="title_desc">Z-A</option>
        <option value="created_at">Mais recentes</option>
      </select>
    </form>
  );
}
