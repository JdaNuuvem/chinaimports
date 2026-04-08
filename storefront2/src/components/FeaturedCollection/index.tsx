import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/medusa-client";
import fallbackData from "@/data/fallback-products.json";

interface FeaturedCollectionProps {
  title?: string;
  linkTitle?: string;
  linkUrl?: string;
  collectionHandle?: string;
  productsToShow?: number;
}

export default async function FeaturedCollection({
  title = "Coleção em Destaque",
  linkTitle = "Ver todos",
  linkUrl = "/collections/all",
  productsToShow = 8,
}: FeaturedCollectionProps) {
  const result = await getProducts(productsToShow, 0);

  const products = result.data?.products ?? (fallbackData.products as Array<{
    id: string;
    title: string;
    handle: string;
    thumbnail: string | null;
    variants: Array<{ prices: Array<{ amount: number }>; original_price: number | null }>;
  }>).slice(0, productsToShow);

  return (
    <section className="section" data-section-type="featured-collection">
      <div className="container">
        <header className="section__header">
          <div className="section__header-stack">
            <h2 className="section__title heading h3">{title}</h2>
          </div>
          {linkTitle && (
            <Link href={linkUrl} className="section__action-link link">
              {linkTitle} →
            </Link>
          )}
        </header>
      </div>

      <div className="container container--flush">
        <style dangerouslySetInnerHTML={{ __html: `
          .featured-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          @media (min-width: 640px) { .featured-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
          @media (min-width: 1024px) { .featured-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }
        `}} />
        <div className="product-list product-list--vertical featured-grid">
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
      </div>
    </section>
  );
}
