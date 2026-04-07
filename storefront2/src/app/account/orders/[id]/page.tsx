"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { getCustomerOrders, AUTH_FLAG_KEY } from "@/lib/medusa-client";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem(AUTH_FLAG_KEY);
    if (!auth) { router.push("/account/login"); return; }

    // For now, fetch all orders and find by ID
    getCustomerOrders().then((result) => {
      const found = result.data?.orders?.find((o) => o.id === params.id || String(o.displayId) === params.id);
      setOrder(found || null);
      setLoading(false);
    });
  }, [params.id, router]);

  if (loading) return <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>Carregando...</div>;

  if (!order) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h1 className="heading h2">Pedido não encontrado</h1>
        <Link href="/account/orders" className="button button--primary" style={{ marginTop: 20, display: "inline-block" }}>
          Ver meus pedidos
        </Link>
      </div>
    );
  }

  const items = (order.items as Array<Record<string, unknown>>) || [];
  const address = order.shippingAddress ? (typeof order.shippingAddress === "string" ? JSON.parse(order.shippingAddress as string) : order.shippingAddress) as Record<string, string> : null;

  return (
    <div className="container" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Link href="/account/orders" style={{ color: "var(--link-color)", fontSize: 14, textDecoration: "none" }}>← Voltar aos pedidos</Link>

      <h1 className="heading h1" style={{ marginTop: 16, marginBottom: 8 }}>
        Pedido #{String(order.displayId || order.id)}
      </h1>

      <div style={{ display: "flex", gap: 16, marginBottom: 30, fontSize: 14, color: "var(--text-color)" }}>
        <span>Data: {new Date(order.created_at as string || order.createdAt as string).toLocaleDateString("pt-BR")}</span>
        <span style={{
          padding: "2px 10px", borderRadius: 12, fontWeight: 600, fontSize: 12,
          background: (order.status as string) === "pending" ? "#fff3cd" : "#d4edda",
          color: (order.status as string) === "pending" ? "#856404" : "#155724",
        }}>
          {(order.status as string) === "pending" ? "Pendente" : "Confirmado"}
        </span>
      </div>

      {/* Items */}
      <div style={{ border: "1px solid var(--border-color)", borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "12px 16px", background: "var(--secondary-background)", fontWeight: 600, fontSize: 14 }}>Itens do pedido</div>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid var(--border-color)" }}>
            <div>
              <p style={{ fontWeight: 500 }}>{item.title as string}</p>
              <p style={{ fontSize: 13, color: "#888" }}>Qtd: {item.quantity as number}</p>
            </div>
            <p style={{ fontWeight: 600 }}>{formatMoney(item.total as number)}</p>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderTop: "2px solid var(--border-color)", fontWeight: 700, fontSize: 16 }}>
          <span>Total</span>
          <span>{formatMoney(order.total as number)}</span>
        </div>
      </div>

      {/* Address */}
      {address && (
        <div style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Endereço de entrega</h3>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-color)" }}>
            {address.first_name} {address.last_name}<br />
            {address.address_1}{address.address_2 ? `, ${address.address_2}` : ""}<br />
            {address.city} - {address.province}<br />
            CEP: {address.postal_code}
          </p>
        </div>
      )}
    </div>
  );
}
