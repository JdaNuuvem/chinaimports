"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AddressForm, { type AddressData } from "@/components/AddressForm";
import { AUTH_TOKEN_KEY } from "@/lib/medusa-client";

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  postalCode: string;
  phone?: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
  const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;

  const loadAddresses = () => {
    if (!token) { setLoading(false); return; }
    fetch(`${backendUrl}/store/customers/me/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setAddresses(d.addresses || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadAddresses(); }, []);

  const handleAdd = async (data: AddressData) => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${backendUrl}/store/customers/me/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          address_1: `${data.address_1}, ${data.number}`,
          address_2: data.address_2,
          city: data.city,
          province: data.province,
          postal_code: data.postal_code,
          country_code: "BR",
          phone: data.phone,
        }),
      });
      if (res.ok) {
        setMsg("Endereço adicionado!");
        setShowAdd(false);
        loadAddresses();
      }
    } catch { setMsg("Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este endereço?")) return;
    await fetch(`${backendUrl}/store/customers/me/addresses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token || ""}` },
    });
    loadAddresses();
  };

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <h1 className="heading h2">Faça login para ver seus endereços</h1>
        <Link href="/account/login" className="button button--primary" style={{ marginTop: 16, display: "inline-block", padding: "12px 32px" }}>
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <nav style={{ marginBottom: 20, fontSize: 13 }}>
        <Link href="/account" style={{ color: "var(--link-color)" }}>Minha Conta</Link>
        <span style={{ margin: "0 8px" }}>›</span>
        <span>Endereços</span>
      </nav>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 className="heading h1">Meus Endereços</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="button button--primary" style={{ fontSize: 14 }}>
          {showAdd ? "Cancelar" : "+ Adicionar endereço"}
        </button>
      </div>

      {msg && <p style={{ color: "#16a34a", marginBottom: 16, fontWeight: 600 }}>{msg}</p>}

      {showAdd && (
        <div style={{ border: "1px solid var(--border-color, #e1e3e5)", borderRadius: 12, padding: 24, marginBottom: 24, background: "#f9fafb" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Novo endereço</h2>
          <AddressForm onSubmit={handleAdd} loading={saving} submitLabel="Salvar endereço" />
        </div>
      )}

      {loading ? (
        <p style={{ color: "#888" }}>Carregando...</p>
      ) : addresses.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Nenhum endereço cadastrado</p>
          <p style={{ fontSize: 13 }}>Adicione um endereço para facilitar suas compras.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="checkout-grid">
          {addresses.map((addr) => (
            <div key={addr.id} style={{
              border: `2px solid ${addr.isDefault ? "var(--accent-color, #1e2d7d)" : "var(--border-color, #e1e3e5)"}`,
              borderRadius: 12, padding: 20, position: "relative",
            }}>
              {addr.isDefault && (
                <span style={{ position: "absolute", top: -10, left: 15, background: "var(--accent-color, #1e2d7d)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 10 }}>
                  Principal
                </span>
              )}
              <p style={{ fontWeight: 600, marginBottom: 8 }}>{addr.firstName} {addr.lastName}</p>
              <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6 }}>
                {addr.address1}<br />
                {addr.address2 && <>{addr.address2}<br /></>}
                {addr.city} - {addr.province}<br />
                CEP: {addr.postalCode}<br />
                {addr.phone && <>Tel: {addr.phone}</>}
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
                {!addr.isDefault && (
                  <button onClick={() => handleDelete(addr.id)} style={{ fontSize: 12, padding: "6px 16px", background: "none", border: "1px solid #dc2626", color: "#dc2626", borderRadius: 6, cursor: "pointer" }}>
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
