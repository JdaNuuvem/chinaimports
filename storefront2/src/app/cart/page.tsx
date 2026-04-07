"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/utils";
import { MinusIcon, PlusIcon, TrashIcon, CartIcon } from "@/components/Icons";
import CartUrgency from "@/components/CartUrgency";
import CrossSell from "@/components/CrossSell";
import ProgressiveDiscount from "@/components/ProgressiveDiscount";
import CartShareLink from "@/components/CartShareLink";
import GiftWrap from "@/components/GiftWrap";
import FreeShippingTier from "@/components/FreeShippingTier";
import SecuritySeal from "@/components/SecuritySeal";

export default function CartPage() {
  const { cart, updateItem, removeItem, loading } = useCart();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
        <div className="empty-state">
          <div style={{ opacity: 0.3, marginBottom: "20px", display: "flex", justifyContent: "center" }}>
            <CartIcon className="w-16 h-16" />
          </div>
          <h1 className="heading h1" style={{ marginBottom: "15px" }}>Seu carrinho está vazio</h1>
          <p style={{ marginBottom: "25px", color: "#888" }}>Adicione produtos ao seu carrinho para continuar</p>
          <Link href="/collections/all" className="button button--primary" style={{ padding: "15px 40px" }}>
            Veja nossos produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "20px" }}>
      <CartUrgency />
      <header className="page__header" style={{ marginBottom: "30px" }}>
        <h1 className="heading h1">Meu carrinho</h1>
      </header>

      <div className="cart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "40px" }}>
        {/* Items */}
        <div className="card">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-color, #e0e0e0)" }}>
                <th style={{ textAlign: "left", padding: "15px 0" }}>Produto</th>
                <th style={{ textAlign: "center", padding: "15px 0" }}>Quantidade</th>
                <th style={{ textAlign: "right", padding: "15px 0" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--border-color, #e0e0e0)" }}>
                  <td style={{ padding: "20px 0" }}>
                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                      {item.thumbnail && (
                        <img src={item.thumbnail} alt={item.title} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }} />
                      )}
                      <div>
                        <p style={{ fontWeight: 600 }}>{item.title}</p>
                        <p style={{ fontSize: "12px", color: "#888" }}>{item.variant.title}</p>
                        <p style={{ marginTop: "5px" }}>{formatMoney(item.unit_price)}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0", border: "1px solid var(--border-color)", borderRadius: "4px" }}>
                      <button onClick={() => updateItem(item.id, item.quantity - 1)} disabled={loading || item.quantity <= 1} style={{ padding: "8px 12px", background: "none", border: "none", cursor: "pointer" }}>
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span style={{ padding: "8px 15px", fontWeight: 600 }}>{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)} disabled={loading || (item.variant?.inventory_quantity !== undefined && item.quantity >= item.variant.inventory_quantity)} style={{ padding: "8px 12px", background: "none", border: "none", cursor: "pointer" }}>
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                      <span style={{ fontWeight: 600 }}>{formatMoney(item.total)}</span>
                      <button onClick={() => removeItem(item.id)} disabled={loading} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: "12px" }}>
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div>
          <div className="card" style={{ padding: "25px", position: "sticky", top: "20px" }}>
            <h2 className="heading h4" style={{ marginBottom: "20px" }}>Resumo</h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Subtotal</span>
              <span>{formatMoney(cart.subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Frete</span>
              <span>{cart.shipping_total > 0 ? formatMoney(cart.shipping_total) : "Grátis"}</span>
            </div>
            {cart.discount_total > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "var(--success-color)" }}>
                <span>Desconto</span>
                <span>-{formatMoney(cart.discount_total)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderTop: "2px solid var(--border-color)", fontWeight: 700, fontSize: "18px" }}>
              <span>Total</span>
              <span>{formatMoney(cart.total)}</span>
            </div>
            <ProgressiveDiscount />
            <GiftWrap />
            <p style={{ fontSize: "12px", color: "#888", textAlign: "center", marginBottom: "15px", marginTop: 15 }}>
              Todas as entregas possuem código de rastreio ♥
            </p>
            <Link href="/checkout" className="button button--primary" style={{ width: "100%", padding: "15px", fontSize: "16px", fontWeight: 700, display: "block", textAlign: "center", textDecoration: "none" }}>
              Finalizar Compra
            </Link>
            <CartShareLink />
            <SecuritySeal />
          </div>
        </div>
      </div>

      <CrossSell />
    </div>
  );
}
