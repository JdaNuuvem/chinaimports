import CollectionList from "@/components/CollectionList";
import { getCollections } from "@/lib/medusa-client";

export default async function CollectionsPage() {
  const result = await getCollections();

  const collections =
    result.data?.collections?.map((c) => ({
      id: c.id,
      title: c.title,
      handle: c.handle,
      image: c.imageUrl || undefined,
      productCount: c.productCount,
    })) ?? undefined;

  return (
    <div style={{ padding: "40px 0" }}>
      <div className="container" style={{ marginBottom: "20px" }}>
        <h1 className="heading h1">Todas as Coleções</h1>
      </div>
      <CollectionList title="" collections={collections} />
    </div>
  );
}
