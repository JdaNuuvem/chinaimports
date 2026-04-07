import type { Product } from "@/lib/medusa-client";
import themeConfig from "@/data/theme-config.json";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductJsonLd({ product, url, reviewCount, averageRating }: { product: Product; url: string; reviewCount?: number; averageRating?: number }) {
  const variant = product.variants?.[0];
  const price = variant?.prices?.[0]?.amount ?? 0;
  const originalPrice = variant?.original_price ?? price;
  const inStock = (variant?.inventory_quantity ?? 0) > 0;

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images?.map((img) => img.url) ?? (product.thumbnail ? [product.thumbnail] : []),
    url,
    sku: variant?.sku || product.id,
    brand: { "@type": "Brand", name: themeConfig.identity.storeName },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BRL",
      price: (price / 100).toFixed(2),
      ...(originalPrice > price ? { highPrice: (originalPrice / 100).toFixed(2) } : {}),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: themeConfig.identity.storeName },
    },
    ...(reviewCount && averageRating ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
  };

  return <JsonLd data={data} />;
}

export function BreadcrumbJsonLd({ items }: { items: { label: string; href?: string }[] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://importschinabrasil.com.br";

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
      })),
    ],
  };

  return <JsonLd data={data} />;
}

export function OrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://importschinabrasil.com.br";

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: themeConfig.identity.storeName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      "https://www.facebook.com/importschinabrasil",
      "https://www.instagram.com/importschinabrasil",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "Portuguese",
    },
  };

  return <JsonLd data={data} />;
}

export function FaqJsonLd({ questions }: { questions: { question: string; answer: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };

  return <JsonLd data={data} />;
}
