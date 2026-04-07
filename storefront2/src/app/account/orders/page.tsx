"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCustomerOrders, AUTH_FLAG_KEY } from "@/lib/medusa-client";
import { formatMoney } from "@/lib/utils";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem(AUTH_FLAG_KEY);
    if (!auth) {
      router.push("/account/login");
      return;
    }

    getCustomerOrders().then((result) => {
      if (result.data?.orders) {
        setOrders(result.data.orders);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>Carregando...</div>;

  return (
    <div className="container" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 className="heading h1" style={{ marginBottom: 30 }}>Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ color: "var(--text-color)", marginBottom: 16 }}>Você ainda não fez nenhum pedido.</p>
          <Link href="/collections/all" className="button button--primary" style={{ display: "inline-block", padding: "12px 24px" }}>
            Comece a comprar
          </Link>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id as string} style={{
              border: "1px solid var(--border-color)", borderRadius: 8, padding: 20, marginBottom: 12,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <p style={{ fontWeight: 600 }}>Pedido #{String((order.display_id as number) || order.id)}</p>
                <p style={{ fontSize: 13, color: "var(--text-color)", marginTop: 4 }}>
                  {new Date(order.created_at as string).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 700 }}>{formatMoney(order.total as number)}</p>
                <p style={{
                  fontSize: 12, fontWeight: 600, marginTop: 4,
                  color: (order.fulfillment_status as string) === "fulfilled" ? "var(--success-color)" : "var(--accent-color)",
                }}>
                  {(order.fulfillment_status as string) === "fulfilled" ? "Entregue" : "Em processamento"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
