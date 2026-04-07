"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getWishlist, removeFromWishlist } from "@/lib/wishlist";
import { resilientFetch, type Product } from "@/lib/medusa-client";

export default function WishlistPage() {
  const [wishlistIds] = useState(() => getWishlist());
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(() => wishlistIds.length > 0);

  useEffect(() => {
    if (wishlistIds.length === 0) return;
    let cancelled = false;
    resilientFetch<{ products: Product[] }>("/store/products?limit=100").then((result) => {
      if (cancelled) return;
      const all = result.data?.products || [];
      setProducts(all.filter((p) => wishlistIds.includes(p.id)));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [wishlistIds]);

  if (loading) return <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>Carregando...</div>;

  return (
    <div className="container" style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <h1 className="heading h1" style={{ marginBottom: 30 }}>Meus Favoritos</h1>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>♡</p>
          <p style={{ color: "var(--text-color)", marginBottom: 16 }}>Você ainda não adicionou nenhum produto aos favoritos.</p>
          <Link href="/collections/all" className="button button--primary" style={{ display: "inline-block", padding: "12px 24px" }}>
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
          {products.map((product) => (
            <div key={product.id} style={{ position: "relative" }}>
              <button
                onClick={() => {
                  removeFromWishlist(product.id);
                  setProducts((prev) => prev.filter((p) => p.id !== product.id));
                }}
                style={{ position: "absolute", top: 8, right: 8, zIndex: 10, background: "#fff", borderRadius: "50%", width: 32, height: 32, border: "1px solid var(--border-color)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                title="Remover dos favoritos"
              >
                ×
              </button>
              <ProductCard
                id={product.id}
                title={product.title}
                handle={product.handle}
                thumbnail={product.thumbnail}
                price={product.variants?.[0]?.prices?.[0]?.amount ?? 0}
                compareAtPrice={product.variants?.[0]?.original_price}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
