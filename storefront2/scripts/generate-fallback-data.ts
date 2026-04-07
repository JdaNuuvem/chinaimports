/**
 * Pre-build script: fetches all products and collections from Medusa
 * and writes them to static JSON files as the last-resort fallback.
 *
 * Usage: npx tsx scripts/generate-fallback-data.ts
 * Runs automatically via "prebuild" in package.json.
 */

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const DATA_DIR = "./src/data";

async function fetchAll<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${MEDUSA_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.warn(`[fallback-gen] ${endpoint} returned ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[fallback-gen] Failed to fetch ${endpoint}:`, (err as Error).message);
    return null;
  }
}

async function main() {
  const fs = await import("fs");
  const path = await import("path");

  const outDir = path.resolve(DATA_DIR);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`[fallback-gen] Fetching from ${MEDUSA_URL}...`);

  // Fetch products (up to 200)
  const productsData = await fetchAll<{ products: unknown[]; count: number }>(
    "/store/products?limit=200&offset=0"
  );

  const productsFile = path.join(outDir, "fallback-products.json");
  if (productsData) {
    fs.writeFileSync(productsFile, JSON.stringify(productsData, null, 2));
    console.log(`[fallback-gen] Wrote ${productsData.products.length} products to ${productsFile}`);
  } else {
    // Write empty fallback if API is unreachable
    const empty = { products: [], count: 0 };
    if (!fs.existsSync(productsFile)) {
      fs.writeFileSync(productsFile, JSON.stringify(empty, null, 2));
      console.log(`[fallback-gen] Wrote empty products fallback`);
    } else {
      console.log(`[fallback-gen] Kept existing products fallback (API unreachable)`);
    }
  }

  // Fetch collections
  const collectionsData = await fetchAll<{ collections: unknown[] }>(
    "/store/collections"
  );

  const collectionsFile = path.join(outDir, "fallback-collections.json");
  if (collectionsData) {
    fs.writeFileSync(collectionsFile, JSON.stringify(collectionsData, null, 2));
    console.log(`[fallback-gen] Wrote ${collectionsData.collections.length} collections to ${collectionsFile}`);
  } else {
    const empty = { collections: [] };
    if (!fs.existsSync(collectionsFile)) {
      fs.writeFileSync(collectionsFile, JSON.stringify(empty, null, 2));
      console.log(`[fallback-gen] Wrote empty collections fallback`);
    } else {
      console.log(`[fallback-gen] Kept existing collections fallback (API unreachable)`);
    }
  }

  console.log("[fallback-gen] Done.");
}

main().catch((err) => {
  console.error("[fallback-gen] Fatal error:", err);
  process.exit(1);
});
