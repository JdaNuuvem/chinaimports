"use client";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { getRecentlyViewed } from "@/lib/recently-viewed";

export default function RecentlyViewed() {
  const [products] = useState(() => getRecentlyViewed());

  if (products.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <div className="section__header">
          <h2 className="section__title heading h3">Vistos recentemente</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} id={product.id} title={product.title} handle={product.handle} thumbnail={product.thumbnail} price={product.price} />
          ))}
        </div>
      </div>
    </section>
  );
}
