"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";

/**
 * Detects when a user has items in cart but is leaving.
 * Sends cart data to backend for abandoned cart recovery emails.
 */
export default function AbandonedCartDetector() {
  const { cart } = useCart();
  const sentRef = useRef(false);

  useEffect(() => {
    if (!cart?.items?.length || sentRef.current) return;

    const handleBeforeUnload = () => {
      // Mark cart as potentially abandoned
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      const payload = JSON.stringify({
        cartId: cart.id,
        items: cart.items.map((i) => ({
          title: i.title,
          quantity: i.quantity,
          price: i.unit_price,
        })),
        total: cart.total,
        timestamp: new Date().toISOString(),
      });

      // Use sendBeacon for reliable delivery during page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${backendUrl}/store/carts/${cart.id}/mark-abandoned`,
          new Blob([payload], { type: "application/json" })
        );
      }
    };

    // Also track inactivity — if user has items but no interaction for 30 min
    const inactivityTimer = setTimeout(() => {
      if (cart.items.length > 0 && !sentRef.current) {
        sentRef.current = true;
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
        fetch(`${backendUrl}/store/carts/${cart.id}/mark-abandoned`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "inactivity" }),
        }).catch(() => {});
      }
    }, 30 * 60 * 1000); // 30 minutes

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearTimeout(inactivityTimer);
    };
  }, [cart]);

  return null; // Invisible component
}
