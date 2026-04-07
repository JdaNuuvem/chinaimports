"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

interface OrderData {
  id: string;
  displayId: number;
  status: string;
  total: number;
  items: { title: string; quantity: number; unitPrice: number }[];
  shippingAddress?: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    province: string;
    postal_code: string;
  } | null;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    fetch(`${backendUrl}/store/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "60px 20px", maxWidth: 640, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 16 }}>
          ✓
        </div>
        <h1 className="heading h2" style={{ color: "#16a34a" }}>Pedido Confirmado!</h1>
        <p style={{ color: "var(--text-color)", marginTop: 8 }}>
          Obrigado pela sua compra. Você receberá um e-mail com os detalhes.
        </p>
      </div>

      {order ? (
        <div style={{ background: "#f9fafb", borderRadius: 12, padding: 24, border: "1px solid var(--border-color, #e1e3e5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Número do pedido</p>
              <p style={{ fontSize: 18, fontWeight: 700 }}>#{order.displayId}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Status</p>
              <span style={{ background: "#dcfce7", color: "#16a34a", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                {order.status === "confirmed" ? "Confirmado" : order.status === "pending" ? "Pendente" : order.status}
              </span>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />

          <p style={{ fontWeight: 600, marginBottom: 12 }}>Itens</p>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14 }}>
              <span>{item.title} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>R$ {((item.unitPrice * item.quantity) / 100).toFixed(2).replace(".", ",")}</span>
            </div>
          ))}

          <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16 }}>
            <span>Total</span>
            <span>R$ {(order.total / 100).toFixed(2).replace(".", ",")}</span>
          </div>

          {order.shippingAddress && (
            <>
              <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "16px 0" }} />
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Endereço de entrega</p>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>
                {order.shippingAddress.first_name} {order.shippingAddress.last_name}<br />
                {order.shippingAddress.address_1}<br />
                {order.shippingAddress.city}, {order.shippingAddress.province} — {order.shippingAddress.postal_code}
              </p>
            </>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          <p>Seu pedido foi registrado com sucesso.</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32 }}>
        <Link href="/account/orders" className="button button--secondary" style={{ padding: "12px 24px", textDecoration: "none" }}>
          Meus Pedidos
        </Link>
        <Link href="/" className="button button--primary" style={{ padding: "12px 24px", textDecoration: "none" }}>
          Continuar Comprando
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>Carregando...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
