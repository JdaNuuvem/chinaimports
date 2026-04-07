"use client";
import { useState } from "react";

export default function ExportData({ backendUrl, token }: { backendUrl: string; token?: string }) {
  const [exporting, setExporting] = useState<string | null>(null);

  const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  const exportCSV = async (type: "products" | "orders" | "customers") => {
    setExporting(type);
    try {
      let data: Array<Record<string, unknown>> = [];
      let filename = "";
      let headers: string[] = [];

      if (type === "products") {
        const res = await fetch(`${backendUrl}/admin/products`, { headers: authHeaders });
        const d = await res.json();
        data = (d.products || []).map((p: Record<string, unknown>) => ({
          id: p.id, title: p.title, handle: p.handle,
          price: ((p.variants as Array<{ prices: Array<{ amount: number }> }>)?.[0]?.prices?.[0]?.amount || 0) / 100,
          variants: (p.variants as Array<{ title: string }>)?.length || 0,
          inventory: (p.variants as Array<{ inventory_quantity: number }>)?.reduce((s: number, v: { inventory_quantity: number }) => s + v.inventory_quantity, 0) || 0,
        }));
        headers = ["id", "title", "handle", "price", "variants", "inventory"];
        filename = "produtos";
      } else if (type === "orders") {
        const res = await fetch(`${backendUrl}/admin/orders`, { headers: authHeaders });
        const d = await res.json();
        data = (d.orders || []).map((o: Record<string, unknown>) => ({
          id: o.displayId, status: o.status, total: ((o.total as number) || 0) / 100,
          payment: o.paymentStatus, fulfillment: o.fulfillmentStatus,
          customer: (o.customer as Record<string, string>)?.email || "anônimo",
          date: new Date(o.createdAt as string).toLocaleDateString("pt-BR"),
        }));
        headers = ["id", "status", "total", "payment", "fulfillment", "customer", "date"];
        filename = "pedidos";
      } else {
        const res = await fetch(`${backendUrl}/admin/customers`, { headers: authHeaders });
        const d = await res.json();
        data = (d.customers || []).map((c: Record<string, unknown>) => ({
          id: c.id, name: `${c.firstName} ${c.lastName}`, email: c.email,
          orders: (c._count as Record<string, number>)?.orders || 0,
          date: new Date(c.createdAt as string).toLocaleDateString("pt-BR"),
        }));
        headers = ["id", "name", "email", "orders", "date"];
        filename = "clientes";
      }

      // Generate CSV
      const csv = [headers.join(","), ...data.map((row) => headers.map((h) => `"${String((row as Record<string, unknown>)[h] || "").replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setExporting(null);
  };

  const btnStyle = (type: string): React.CSSProperties => ({
    padding: "8px 16px", border: "1px solid #c9cccf", borderRadius: 8,
    background: exporting === type ? "#f6f6f7" : "#fff", cursor: "pointer",
    fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
    opacity: exporting && exporting !== type ? 0.5 : 1,
  });

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => exportCSV("products")} style={btnStyle("products")} disabled={!!exporting}>
        📦 {exporting === "products" ? "..." : "Produtos"}
      </button>
      <button onClick={() => exportCSV("orders")} style={btnStyle("orders")} disabled={!!exporting}>
        📋 {exporting === "orders" ? "..." : "Pedidos"}
      </button>
      <button onClick={() => exportCSV("customers")} style={btnStyle("customers")} disabled={!!exporting}>
        👥 {exporting === "customers" ? "..." : "Clientes"}
      </button>
    </div>
  );
}
