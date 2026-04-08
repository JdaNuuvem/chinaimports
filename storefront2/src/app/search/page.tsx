import { searchProducts } from "@/lib/medusa-client";
import ProductCard from "@/components/ProductCard";
import { translate } from "@/data/translations";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return {
    title: q ? `Busca: ${q} | Imports China Brasil` : "Busca | Imports China Brasil",
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;

  let products: Array<{
    id: string;
    title: string;
    handle: string;
    thumbnail: string | null;
    variants: Array<{ prices: Array<{ amount: number }>; original_price: number | null }>;
  }> = [];

  let degraded = false;

  if (q && q.trim()) {
    const result = await searchProducts(q.trim());
    products = (result.data?.hits ?? []) as typeof products;
    degraded = result.degraded;
  }

  return (
    <div className="container" style={{ padding: "30px 20px" }}>
      <h1 className="heading h2" style={{ marginBottom: 20 }}>{translate("search.general.title")}</h1>

      <form action="/search" method="GET" style={{ marginBottom: 30, display: "flex", gap: 8 }}>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder={translate("search.general.input_placeholder")}
          style={{ flex: 1, padding: "12px 16px", border: "1px solid var(--border-color)", borderRadius: 4, fontSize: 16 }}
        />
        <button type="submit" className="button button--primary" style={{ padding: "12px 24px" }}>
          Buscar
        </button>
      </form>

      {degraded && (
        <p style={{ color: "var(--error-color)", marginBottom: 16, fontSize: 14 }}>
          A busca pode estar temporariamente indisponível.
        </p>
      )}

      {q && products.length === 0 && !degraded && (
        <p style={{ color: "var(--text-color)", fontSize: 16 }}>
          {translate("search.general.no_results_with_terms", { terms: q })}
        </p>
      )}

      {products.length > 0 && (
        <>
          <p style={{ marginBottom: 20, color: "var(--text-color)" }}>
            {products.length} resultado{products.length !== 1 ? "s" : ""} para &ldquo;{q}&rdquo;
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
            {products.map((product) => (
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
                inventoryQuantity={product.variants?.[0]?.inventory_quantity}
                lunaCheckoutUrl={(product as { luna_checkout_url?: string | null }).luna_checkout_url}
                skipCart={(product as { skip_cart?: boolean }).skip_cart}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
