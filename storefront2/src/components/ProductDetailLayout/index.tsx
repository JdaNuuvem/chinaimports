"use client";
import { useState, useMemo, useEffect } from "react";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import { trackViewItem } from "@/lib/sentinel";
import type { Product, ProductVariant } from "@/lib/medusa-client";

interface ProductDetailLayoutProps {
  product: Product;
  discount: number;
}

interface VariantWithImages extends ProductVariant {
  images?: Array<{ id: string; url: string }>;
}

export default function ProductDetailLayout({ product, discount }: ProductDetailLayoutProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);

  // Fire view_item once on mount
  useEffect(() => {
    const price = product.variants?.[0]?.prices?.[0]?.amount ?? 0;
    trackViewItem({
      id: product.id,
      title: product.title,
      price,
      category: product.collection?.title,
    });
  }, [product.id, product.title, product.variants, product.collection?.title]);

  // If variant has its own images, show them; otherwise fall back to product images
  const galleryImages = useMemo(() => {
    const v = selectedVariant as VariantWithImages;
    if (v?.images && v.images.length > 0) return v.images;
    return product.images || [];
  }, [selectedVariant, product.images]);

  return (
    <div className="pdp-grid">
      <div>
        <ProductGallery
          images={galleryImages}
          productTitle={product.title}
          discount={discount}
        />
      </div>
      <div>
        <ProductInfo
          product={product}
          onVariantChange={setSelectedVariant}
        />
      </div>
    </div>
  );
}
