"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Product } from "@/lib/medusa-client";
import ProductCard from "@/components/ProductCard";
import CollectionFilters from "@/components/CollectionFilters";

interface Props {
  products: Product[];
}

export default function CollectionProductGrid({ products }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from URL search params (shareable links)
  const [filters, setFilters] = useState(() => ({
    priceRange: [
      Number(searchParams.get("min") ?? 0),
      Number(searchParams.get("max") ?? 100000),
    ] as [number, number],
    sizes: searchParams.get("sizes")?.split(",").filter(Boolean) ?? [],
    colors: searchParams.get("colors")?.split(",").filter(Boolean) ?? [],
    sortBy: searchParams.get("sort") ?? "relevance",
  }));

  // Sync filters → URL (debounced)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (filters.priceRange[0] > 0) params.set("min", String(filters.priceRange[0])); else params.delete("min");
    if (filters.priceRange[1] < 100000) params.set("max", String(filters.priceRange[1])); else params.delete("max");
    if (filters.sizes.length > 0) params.set("sizes", filters.sizes.join(",")); else params.delete("sizes");
    if (filters.colors.length > 0) params.set("colors", filters.colors.join(",")); else params.delete("colors");
    if (filters.sortBy !== "relevance") params.set("sort", filters.sortBy); else params.delete("sort");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Debounce filter changes
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const debouncedSetFilters = useCallback((newFilters: typeof filters) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setFilters(newFilters), 150);
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];

    // Price filter
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) {
      result = result.filter((p) => {
        const price = p.variants?.[0]?.prices?.[0]?.amount ?? 0;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    // Size filter
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.variants?.some((v) =>
          filters.sizes.some((size) =>
            v.title?.toLowerCase().includes(size.toLowerCase())
          )
        )
      );
    }

    // Color filter
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.variants?.some((v) =>
          filters.colors.some((color) =>
            v.title?.toLowerCase().includes(color.toLowerCase())
          )
        )
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.variants?.[0]?.prices?.[0]?.amount ?? 0) - (b.variants?.[0]?.prices?.[0]?.amount ?? 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.variants?.[0]?.prices?.[0]?.amount ?? 0) - (a.variants?.[0]?.prices?.[0]?.amount ?? 0));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [products, filters]);

  return (
    <>
      <CollectionFilters onFilterChange={setFilters} />

      {filtered.length === 0 ? (
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 18, color: "var(--text-color)" }}>
            Nenhum produto encontrado com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="collection-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              handle={product.handle}
              thumbnail={product.thumbnail}
              price={product.variants?.[0]?.prices?.[0]?.amount ?? 0}
              compareAtPrice={product.variants?.[0]?.original_price}
              variantId={product.variants?.[0]?.id}
              inStock={(product.variants?.[0]?.inventory_quantity ?? 0) > 0}
            />
          ))}
        </div>
      )}

      <p style={{ textAlign: "center", color: "#9ca3af", marginTop: 16, fontSize: 13 }}>
        {filtered.length} de {products.length} produtos
      </p>
    </>
  );
}
