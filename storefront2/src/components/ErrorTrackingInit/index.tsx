"use client";
import { useEffect } from "react";
import { installGlobalErrorHandlers } from "@/lib/error-tracking";
import { loadWishlistFromBackend } from "@/lib/wishlist";

export default function ErrorTrackingInit() {
  useEffect(() => {
    installGlobalErrorHandlers();
    // Pull authoritative wishlist from backend if logged in
    void loadWishlistFromBackend();
  }, []);
  return null;
}
