import { getProduct, getProducts, type Product } from "@/lib/medusa-client";
import Breadcrumb from "@/components/Breadcrumb";
import ProductDetailLayout from "@/components/ProductDetailLayout";
import ProductReviews from "@/components/ProductReviews";
import StickyAddToCart from "@/components/StickyAddToCart";
import DegradedBanner from "@/components/DegradedBanner";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { calculateDiscount } from "@/lib/utils";
import fallbackData from "@/data/fallback-products.json";

export const revalidate = 300; // ISR: revalidate every 5 minutes
export const dynamicParams = true;

export async function generateStaticParams() {
  const result = await getProducts(100, 0);
  const products = result.data?.products ?? fallbackData.products;
  return products
    .filter((p) => p.handle)
    .map((p) => ({ slug: p.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getProduct(slug);
  const product = result.data?.products?.[0];

  if (!product) {
    return { title: "Produto não encontrado | Imports China Brasil" };
  }

  return {
    title: `${product.title} | Imports China Brasil`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description?.slice(0, 160),
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getProduct(slug);
  const product = result.data?.products?.[0] as Product | undefined;

  const fallbackProduct = !product
    ? (fallbackData.products as unknown as Product[]).find((p) => p.handle === slug)
    : null;

  const displayProduct = product || fallbackProduct;

  if (!displayProduct) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h1 className="heading h2">Produto não encontrado</h1>
        <p style={{ marginTop: 16, color: "var(--text-color)" }}>
          O produto que você está procurando não existe ou foi removido.
        </p>
      </div>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://importschinabrasil.com.br";
  const price = displayProduct.variants?.[0]?.prices?.[0]?.amount ?? 0;
  const comparePrice = displayProduct.variants?.[0]?.original_price;
  const discount = (comparePrice != null && comparePrice > price)
    ? calculateDiscount(comparePrice, price)
    : 0;

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <ProductJsonLd product={displayProduct} url={`${siteUrl}/product/${slug}`} />
      <BreadcrumbJsonLd items={[
        { label: "Todos os produtos", href: "/collections/all" },
        { label: displayProduct.title },
      ]} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>
        {result.degraded && <DegradedBanner />}

        {/* Breadcrumb */}
        <div style={{ padding: "12px 0" }}>
          <Breadcrumb items={[
            { label: displayProduct.title },
          ]} />
        </div>

        {/* Responsive CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          .pdp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
          @media (max-width: 768px) { .pdp-grid { grid-template-columns: 1fr; gap: 20px; } }
        `}} />

        {/* Product: gallery + info — two columns (orchestrated client component for variant sync) */}
        <ProductDetailLayout product={displayProduct} discount={discount} />

        {/* Separator */}
        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "40px 0" }} />

        {/* Reviews section */}
        <div style={{ marginBottom: 60 }}>
          <ProductReviews productId={displayProduct.id} />
        </div>
      </div>

      <StickyAddToCart
        productTitle={displayProduct.title}
        price={price}
        comparePrice={comparePrice}
        variantId={displayProduct.variants?.[0]?.id ?? ""}
        inStock={(displayProduct.variants?.[0]?.inventory_quantity ?? 0) > 0}
        thumbnail={displayProduct.thumbnail}
        lunaCheckoutUrl={(displayProduct as Product & { luna_checkout_url?: string | null }).luna_checkout_url}
      />
    </div>
  );
}
