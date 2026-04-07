"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CollectionCard {
  id: string;
  title: string;
  handle: string;
  image?: string;
  productCount?: number;
}

interface CollectionListProps {
  title?: string;
  collections?: CollectionCard[];
}

export default function CollectionList({ title = "Nossas Coleções", collections: propCollections }: CollectionListProps) {
  const [collections, setCollections] = useState<CollectionCard[]>(propCollections || []);
  const [loading, setLoading] = useState(!propCollections?.length);

  useEffect(() => {
    if (propCollections?.length) return;

    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    fetch(`${backendUrl}/store/collections`)
      .then((r) => r.json())
      .then((data) => {
        if (data.collections?.length > 0) {
          setCollections(
            data.collections.map((col: { id: string; title: string; handle: string; imageUrl?: string; productCount?: number }) => ({
              id: col.id,
              title: col.title,
              handle: col.handle,
              image: col.imageUrl || undefined,
              productCount: col.productCount,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propCollections]);

  if (loading) {
    return (
      <section className="section" data-section-type="collection-list">
        <div className="container">
          {title && (
            <header className="section__header">
              <h2 className="section__title heading h3">{title}</h2>
            </header>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 220, borderRadius: 12, background: "#f0f0f0", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!collections.length) return null;

  return (
    <section className="section" data-section-type="collection-list">
      <div className="container">
        {title && (
          <header className="section__header">
            <h2 className="section__title heading h3">{title}</h2>
          </header>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {collections.map((col) => (
            <Link key={col.id} href={`/collections/${col.handle}`} style={{ display: "block", position: "relative", overflow: "hidden", borderRadius: "12px", height: "220px", textDecoration: "none", color: "#fff" }}>
              {col.image ? (
                <img src={col.image} alt={col.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, transition: "transform 0.3s" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, background: `hsl(${col.title.charCodeAt(0) * 7 % 360}, 50%, 40%)` }} />
              )}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "25px", background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                <h3 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>{col.title}</h3>
                {col.productCount != null && <p style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px" }}>{col.productCount} produtos</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
