"use client";
import Link from "next/link";
import { CloseIcon, TrashIcon, PlusIcon, MinusIcon } from "@/components/Icons";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/utils";
import { getThemeConfig } from "@/lib/theme-config";

export default function MiniCart() {
  const { cart, cartOpen, setCartOpen, updateItem, removeItem, loading } = useCart();

  return (
    <>
      {cartOpen && <div className="modal__overlay" onClick={() => setCartOpen(false)} />}
      <div className={`mini-cart ${cartOpen ? "is-open" : ""}`} aria-hidden={!cartOpen}>
        <div className="mini-cart__header">
          <h2 className="mini-cart__title heading h4">Carrinho</h2>
          <button onClick={() => setCartOpen(false)} aria-label="Fechar">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mini-cart__content">
          {!cart || cart.items.length === 0 ? (
            <div className="mini-cart__empty">
              <p>Seu carrinho está vazio</p>
              <Link href="/collections/all" className="button button--primary" onClick={() => setCartOpen(false)}>
                Veja nossos produtos
              </Link>
            </div>
          ) : (
            <>
              <ul className="mini-cart__items">
                {cart.items.map((item) => (
                  <li key={item.id} className="mini-cart__item">
                    {item.thumbnail && (
                      <div className="mini-cart__item-image">
                        <img src={item.thumbnail} alt={item.title} />
                      </div>
                    )}
                    <div className="mini-cart__item-info">
                      <p className="mini-cart__item-title">{item.title}</p>
                      <p className="mini-cart__item-variant">{item.variant.title}</p>
                      <div className="mini-cart__item-quantity">
                        <button onClick={() => updateItem(item.id, item.quantity - 1)} disabled={loading || item.quantity <= 1}>
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)} disabled={loading}>
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="mini-cart__item-price">{formatMoney(item.total)}</p>
                    </div>
                    <button className="mini-cart__item-remove" onClick={() => removeItem(item.id)} disabled={loading}>
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mini-cart__footer">
                <MiniCartFreeShipping subtotal={cart.subtotal} />
                <div className="mini-cart__total">
                  <span>Total</span>
                  <span>{formatMoney(cart.total)}</span>
                </div>
                <Link href="/checkout" className="button button--primary mini-cart__checkout" onClick={() => setCartOpen(false)}>
                  Finalizar Compra
                </Link>
                <Link href="/cart" style={{ display: "block", textAlign: "center", marginTop: 8, fontSize: 13, color: "var(--link-color)", textDecoration: "none" }} onClick={() => setCartOpen(false)}>
                  Ver carrinho completo
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <MiniCartFreeShippingStyles />
      <style jsx>{`
        .mini-cart {
          position: fixed;
          top: 0;
          right: -420px;
          width: 420px;
          max-width: 100vw;
          height: 100vh;
          background: var(--background, #fff);
          z-index: 1000;
          transition: right 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: -2px 0 10px rgba(0,0,0,0.1);
        }
        .mini-cart.is-open { right: 0; }
        .mini-cart__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--border-color, #e0e0e0);
        }
        .mini-cart__header button { background: none; border: none; cursor: pointer; }
        .mini-cart__content { flex: 1; overflow-y: auto; padding: 20px; }
        .mini-cart__empty { text-align: center; padding: 40px 0; }
        .mini-cart__empty p { margin-bottom: 20px; color: var(--text-color); }
        .mini-cart__items { list-style: none; padding: 0; margin: 0; }
        .mini-cart__item {
          display: flex;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid var(--border-color, #e0e0e0);
        }
        .mini-cart__item-image { width: 80px; height: 80px; flex-shrink: 0; }
        .mini-cart__item-image img { width: 100%; height: 100%; object-fit: cover; }
        .mini-cart__item-info { flex: 1; }
        .mini-cart__item-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
        .mini-cart__item-variant { font-size: 12px; color: #888; margin-bottom: 8px; }
        .mini-cart__item-quantity {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .mini-cart__item-quantity button {
          background: none;
          border: 1px solid var(--border-color, #e0e0e0);
          width: 28px; height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 4px;
        }
        .mini-cart__item-price { font-weight: 600; }
        .mini-cart__item-remove { background: none; border: none; cursor: pointer; color: #999; align-self: flex-start; }
        .mini-cart__footer { padding-top: 20px; border-top: 1px solid var(--border-color, #e0e0e0); }
        .mini-cart__total {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .mini-cart__notice { font-size: 12px; text-align: center; color: #888; margin-bottom: 15px; }
        .mini-cart__checkout { display: block; width: 100%; text-align: center; }
        .modal__overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
        }
      `}</style>
    </>
  );
}

function MiniCartFreeShipping({ subtotal }: { subtotal: number }) {
  const config = getThemeConfig();
  const threshold = config.cart.freeShippingThreshold || 29900;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);

  return (
    <div style={{ marginBottom: 12, padding: "8px 0" }}>
      {remaining > 0 ? (
        <>
          <p style={{ fontSize: 12, color: "#92400e", textAlign: "center", marginBottom: 4 }}>
            Faltam <strong>{formatMoney(remaining)}</strong> para frete grátis!
          </p>
          <div style={{ height: 4, background: "#fde68a", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct > 75 ? "#16a34a" : "#f59e0b", borderRadius: 2, transition: "width 0.5s" }} />
          </div>
        </>
      ) : (
        <p style={{ fontSize: 12, color: "#16a34a", textAlign: "center", fontWeight: 600 }}>
          🎉 Frete grátis ativado!
        </p>
      )}
    </div>
  );
}

function MiniCartFreeShippingStyles() {
  return null; // placeholder for future styles
}
