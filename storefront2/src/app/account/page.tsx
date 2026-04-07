"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCustomer, logoutCustomer, AUTH_FLAG_KEY } from "@/lib/medusa-client";

export default function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem(AUTH_FLAG_KEY);
    if (!auth) {
      router.push("/account/login");
      return;
    }

    getCustomer().then((result) => {
      if (result.data?.customer) {
        setCustomer(result.data.customer);
      } else {
        localStorage.removeItem(AUTH_FLAG_KEY);
        router.push("/account/login");
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>Carregando...</div>;

  const handleLogout = async () => {
    await logoutCustomer();
    router.push("/");
  };

  return (
    <div className="container" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <h1 className="heading h1" style={{ marginBottom: 30 }}>Minha Conta</h1>

      {customer && (
        <div style={{ background: "var(--secondary-background)", padding: 24, borderRadius: 8, marginBottom: 30 }}>
          <p style={{ fontWeight: 600, fontSize: 18 }}>
            {(customer.first_name as string) || ""} {(customer.last_name as string) || ""}
          </p>
          <p style={{ color: "var(--text-color)", marginTop: 4 }}>{customer.email as string}</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 30 }}>
        <Link href="/account/orders" style={{
          padding: 24, border: "1px solid var(--border-color)", borderRadius: 8,
          textDecoration: "none", color: "var(--heading-color)", textAlign: "center",
        }}>
          <p style={{ fontSize: 24, marginBottom: 8 }}>📦</p>
          <p style={{ fontWeight: 600 }}>Meus Pedidos</p>
        </Link>
        <Link href="/account/addresses" style={{
          padding: 24, border: "1px solid var(--border-color)", borderRadius: 8,
          textDecoration: "none", color: "var(--heading-color)", textAlign: "center",
        }}>
          <p style={{ fontSize: 24, marginBottom: 8 }}>📍</p>
          <p style={{ fontWeight: 600 }}>Endereços</p>
        </Link>
        <button onClick={handleLogout} style={{
          padding: 24, border: "1px solid var(--border-color)", borderRadius: 8,
          background: "transparent", cursor: "pointer", color: "var(--heading-color)", textAlign: "center",
        }}>
          <p style={{ fontSize: 24, marginBottom: 8 }}>🚪</p>
          <p style={{ fontWeight: 600 }}>Sair</p>
        </button>
      </div>
    </div>
  );
}
