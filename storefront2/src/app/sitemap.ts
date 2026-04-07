import type { MetadataRoute } from "next";
import { getProducts, getCollections } from "@/lib/medusa-client";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://importschinabrasil.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/collections`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/search`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
  ];

  // Products
  const productsResult = await getProducts(200, 0);
  if (productsResult.data?.products) {
    for (const product of productsResult.data.products) {
      entries.push({
        url: `${BASE_URL}/product/${product.handle}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // Collections
  const collectionsResult = await getCollections();
  if (collectionsResult.data?.collections) {
    for (const collection of collectionsResult.data.collections) {
      entries.push({
        url: `${BASE_URL}/collections/${collection.handle}`,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  // Blog posts
  const posts = getAllPosts();
  for (const post of posts) {
    entries.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
