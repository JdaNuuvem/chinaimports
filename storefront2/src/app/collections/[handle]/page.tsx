import { getCollection, getProducts, getProductsByCollection, getCollections, type Product } from "@/lib/medusa-client";
import Breadcrumb from "@/components/Breadcrumb";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import DegradedBanner from "@/components/DegradedBanner";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import CollectionProductGrid from "./CollectionProductGrid";
import fallbackData from "@/data/fallback-products.json";
import fallbackCollections from "@/data/fallback-collections.json";

export const revalidate = 120; // ISR: 2 minutes

const PRODUCTS_PER_PAGE = 12;

export async function generateStaticParams() {
  const result = await getCollections();
  const collections = result.data?.collections ?? fallbackCollections.collections;
  return collections
    .filter((c: { handle?: string }) => c.handle)
    .map((c: { handle: string }) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const result = await getCollection(handle);
  const collection = result.data?.collections?.[0] as { title?: string; description?: string; image?: string; thumbnail?: string } | undefined;
  const title = collection?.title || handle.charAt(0).toUpperCase() + handle.slice(1).replace(/-/g, " ");
  const description = collection?.description ||
    `Explore nossa coleção ${title}. Encontre os melhores produtos importados com frete grátis para todo Brasil.`;
  const image = collection?.image || collection?.thumbnail;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://importschinabrasil.com.br";
  const url = `${siteUrl}/collections/${handle}`;

  return {
    title: `${title} | Imports China Brasil`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { handle } = await params;
  const { page: pageParam, sort } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const offset = (currentPage - 1) * PRODUCTS_PER_PAGE;

  // Fetch collection info
  const collectionResult = await getCollection(handle);
  const collection = collectionResult.data?.collections?.[0];
  const title = collection?.title || handle.charAt(0).toUpperCase() + handle.slice(1).replace(/-/g, " ");

  // Fetch products — filtered by collection if found
  const productsResult = collection?.id
    ? await getProductsByCollection(collection.id, PRODUCTS_PER_PAGE, offset)
    : await getProducts(PRODUCTS_PER_PAGE, offset);
  const products = productsResult.data?.products ?? (fallbackData.products as unknown as Product[]).slice(offset, offset + PRODUCTS_PER_PAGE);
  const totalCount = productsResult.data?.count ?? (fallbackData.products as unknown[]).length;
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);
  const degraded = collectionResult.degraded || productsResult.degraded;

  return (
    <div className="container container--flush" style={{ padding: 20 }}>
      {degraded && <DegradedBanner />}

      <div className="page__sub-header">
        <Breadcrumb items={[{ label: title }]} />
      </div>

      <BreadcrumbJsonLd items={[{ label: title, href: `/collections/${handle}` }]} />

      <header className="page__header" style={{ marginBottom: 20 }}>
        <h1 className="page__title heading h1">{title}</h1>
        <p style={{ color: "#888", marginTop: 4 }}>{totalCount} produtos</p>
      </header>

      <CollectionProductGrid products={products} />

      {totalPages > 1 && (
        <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl={`/collections/${handle}`}
          />
        </div>
      )}
    </div>
  );
}
