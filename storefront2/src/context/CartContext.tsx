"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  type Cart,
  createCart,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "@/lib/medusa-client";
import { enqueueCartOp, getQueuedOps, dequeueCartOp } from "@/lib/cart-queue";

interface CartContextType {
  cart: Cart | null;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  itemCount: number;
  loading: boolean;
  degraded: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize cart with full error handling
  useEffect(() => {
    const initCart = async () => {
      try {
        const existingCartId = localStorage.getItem("cart_id");
        if (existingCartId) {
          const result = await getCart(existingCartId);
          if (result.data?.cart) {
            setCart(result.data.cart);
            setDegraded(result.degraded);
            return;
          }
          localStorage.removeItem("cart_id");
        }

        const result = await createCart();
        if (result.data?.cart) {
          localStorage.setItem("cart_id", result.data.cart.id);
          setCart(result.data.cart);
        } else {
          setDegraded(true);
        }
      } catch {
        setDegraded(true);
      }
    };
    initCart();
  }, []);

  // Retry queued operations periodically
  useEffect(() => {
    if (!cart) return;

    const retryQueued = async () => {
      const ops = getQueuedOps();
      for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        let result;
        try {
          if (op.action === "add" && op.variantId) {
            result = await addToCart(cart.id, op.variantId, op.quantity ?? 1);
          } else if (op.action === "update" && op.itemId && op.quantity !== undefined) {
            result = await updateCartItem(cart.id, op.itemId, op.quantity);
          } else if (op.action === "remove" && op.itemId) {
            result = await removeFromCart(cart.id, op.itemId);
          }
          if (result?.data?.cart) {
            setCart(result.data.cart);
            dequeueCartOp(i);
            i--; // Adjust index after removal
          }
        } catch {
          break; // Stop retrying if still failing
        }
      }
    };

    const interval = setInterval(retryQueued, 30_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") retryQueued();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Try once on mount
    retryQueued();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [cart]);

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    if (!cart) return;
    setLoading(true);
    setError(null);
    try {
      const result = await addToCart(cart.id, variantId, quantity);
      if (result.data?.cart) {
        setCart(result.data.cart);
        setCartOpen(true);
        setDegraded(result.degraded);
        // Track add_to_cart event — find the just-added item to grab title/price
        const addedItem = result.data.cart.items.find((it) => it.variant?.id === variantId);
        if (addedItem) {
          import("@/lib/sentinel").then(({ trackAddToCart }) => {
            trackAddToCart({
              variantId,
              productId: addedItem.id,
              title: addedItem.title,
              price: addedItem.unit_price,
              quantity,
            });
          }).catch(() => {});
        }
      } else {
        // Queue for retry
        enqueueCartOp({ action: "add", cartId: cart.id, variantId, quantity });
        setError("Não foi possível adicionar ao carrinho. Tentaremos novamente.");
        setDegraded(true);
      }
    } catch {
      enqueueCartOp({ action: "add", cartId: cart.id, variantId, quantity });
      setError("Erro de conexão. O item será adicionado quando a conexão voltar.");
      setDegraded(true);
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const updateItemFn = useCallback(async (itemId: string, quantity: number) => {
    if (!cart) return;
    setLoading(true);
    setError(null);
    try {
      const result = await updateCartItem(cart.id, itemId, quantity);
      if (result.data?.cart) {
        setCart(result.data.cart);
      } else {
        enqueueCartOp({ action: "update", cartId: cart.id, itemId, quantity });
        setError("Não foi possível atualizar. Tentaremos novamente.");
      }
    } catch {
      enqueueCartOp({ action: "update", cartId: cart.id, itemId, quantity });
      setError("Erro de conexão ao atualizar o carrinho.");
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const removeItemFn = useCallback(async (itemId: string) => {
    if (!cart) return;
    // Snapshot the line BEFORE the request so we can fire the tracker
    // event with real data even after the line is gone.
    const removedLine = cart.items.find((i) => i.id === itemId);
    setLoading(true);
    setError(null);
    try {
      const result = await removeFromCart(cart.id, itemId);
      if (result.data?.cart) {
        setCart(result.data.cart);
        if (removedLine) {
          import("@/lib/sentinel").then(({ trackRemoveFromCart }) => {
            trackRemoveFromCart({
              variantId: removedLine.variant?.id || "",
              productId: "",
              title: removedLine.title || "",
              price: removedLine.unit_price || 0,
              quantity: removedLine.quantity || 1,
            });
          }).catch(() => {});
        }
      } else {
        enqueueCartOp({ action: "remove", cartId: cart.id, itemId });
        setError("Não foi possível remover. Tentaremos novamente.");
      }
    } catch {
      enqueueCartOp({ action: "remove", cartId: cart.id, itemId });
      setError("Erro de conexão ao remover item.");
    } finally {
      setLoading(false);
    }
  }, [cart]);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{
      cart, cartOpen, setCartOpen,
      addItem, updateItem: updateItemFn, removeItem: removeItemFn,
      itemCount, loading, degraded, error,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
