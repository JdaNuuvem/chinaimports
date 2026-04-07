"use client";
import { useState, useEffect, useCallback } from "react";
import { toggleWishlist, isInWishlist } from "@/lib/wishlist";

interface WishlistButtonProps {
  productId: string;
  size?: number;
}

export default function WishlistButton({ productId, size = 20 }: WishlistButtonProps) {
  const [inList, setInList] = useState(false);

  useEffect(() => {
    setInList(isInWishlist(productId));
  }, [productId]);

  const handleToggle = useCallback(() => {
    const result = toggleWishlist(productId);
    setInList(result.inWishlist);
  }, [productId]);

  return (
    <button
      onClick={handleToggle}
      aria-label={inList ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      title={inList ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 4,
        lineHeight: 1,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill={inList ? "#e22120" : "none"} stroke={inList ? "#e22120" : "currentColor"} strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
