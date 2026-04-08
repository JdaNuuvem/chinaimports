import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/medusa-client";

interface ProductRecommendationsProps {
  title?: string;
  excludeProductId?: string;
}

export default async function ProductRecommendations({ title = "Você também pode gostar", excludeProductId }: ProductRecommendationsProps) {
  const result = await getProducts(8, 0);
  const products = (result.data?.products || [])
    .filter((p) => p.id !== excludeProductId)
    .slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <header className="section__header">
          <h2 className="section__title heading h3">{title}</h2>
        </header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              title={p.title}
              handle={p.handle}
              thumbnail={p.thumbnail}
              price={p.variants?.[0]?.prices?.[0]?.amount ?? 0}
              compareAtPrice={p.variants?.[0]?.original_price}
              variantId={p.variants?.[0]?.id}
              inStock={(p.variants?.[0]?.inventory_quantity ?? 0) > 0}
              inventoryQuantity={p.variants?.[0]?.inventory_quantity}
              lunaCheckoutUrl={(p as { luna_checkout_url?: string | null }).luna_checkout_url}
              skipCart={(p as { skip_cart?: boolean }).skip_cart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
