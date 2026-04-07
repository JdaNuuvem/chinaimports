"use client";

import { useState, useEffect } from "react";
import { Section } from "./shared";
import ImageUpload from "@/components/ImageUpload";

interface Collection {
  id: string;
  title: string;
  handle: string;
  imageUrl?: string | null;
}

interface Product {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  collection_id?: string | null;
}

export default function CollectionsTab({ backendUrl, token }: { backendUrl: string; token?: string }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCol, setNewCol] = useState({ title: "", handle: "", imageUrl: "" });
  const [editing, setEditing] = useState<Collection | null>(null);
  const [editForm, setEditForm] = useState({ title: "", handle: "", imageUrl: "" });
  const [editProducts, setEditProducts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const headers: HeadersInit = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };

  const load = () => {
    Promise.resolve().then(() => {
      setLoading(true);
      Promise.all([
        fetch(`${backendUrl}/store/collections`).then((r) => r.json()),
        fetch(`${backendUrl}/admin/products`, { headers }).then((r) => r.json()),
      ]).then(([colData, prodData]) => {
        setCollections(colData.collections || []);
        setAllProducts(prodData.products || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  };

  useEffect(() => {
    Promise.all([
      fetch(`${backendUrl}/store/collections`).then((r) => r.json()),
      fetch(`${backendUrl}/admin/products`, { headers }).then((r) => r.json()),
    ]).then(([colData, prodData]) => {
      setCollections(colData.collections || []);
      setAllProducts(prodData.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  const generateHandle = (title: string) =>
    title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleAdd = async () => {
    if (!newCol.title) return;
    const handle = newCol.handle || generateHandle(newCol.title);
    const res = await fetch(`${backendUrl}/admin/collections`, {
      method: "POST", headers,
      body: JSON.stringify({ title: newCol.title, handle, imageUrl: newCol.imageUrl || null }),
    });
    if (res.ok) {
      setMsg({ text: `Coleção "${newCol.title}" criada!`, type: "success" });
      setNewCol({ title: "", handle: "", imageUrl: "" });
      setShowAdd(false);
      load();
    } else {
      const d = await res.json().catch(() => null);
      setMsg({ text: d?.error || "Erro ao criar", type: "error" });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir coleção "${title}"? Os produtos não serão excluídos.`)) return;
    const res = await fetch(`${backendUrl}/admin/collections/${id}`, { method: "DELETE", headers });
    if (res.ok) { setMsg({ text: `"${title}" excluída`, type: "success" }); load(); }
    else setMsg({ text: "Erro ao excluir", type: "error" });
  };

  const openEdit = (col: Collection) => {
    setEditing(col);
    setEditForm({ title: col.title, handle: col.handle, imageUrl: col.imageUrl || "" });
    // Find products in this collection
    const colProducts = allProducts.filter((p) => p.collection_id === col.id).map((p) => p.id);
    setEditProducts(colProducts);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`${backendUrl}/admin/collections/${editing.id}`, {
      method: "PUT", headers,
      body: JSON.stringify({ title: editForm.title, imageUrl: editForm.imageUrl || null }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg({ text: "Coleção atualizada!", type: "success" });
      setEditing(null);
      load();
    } else {
      setMsg({ text: "Erro ao atualizar", type: "error" });
    }
  };

  const toggleProduct = (productId: string) => {
    setEditProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // ── EDIT VIEW ──
  if (editing) {
    return (
      <div>
        <button onClick={() => setEditing(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6d7175", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          ← Voltar para a lista
        </button>

        {msg && (
          <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13, background: msg.type === "success" ? "#f1f8f5" : "#fef3f2", color: msg.type === "success" ? "#1a7346" : "#d72c0d", border: `1px solid ${msg.type === "success" ? "#aee9d1" : "#fead9a"}` }}>
            {msg.type === "success" ? "✓" : "✕"} {msg.text}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          {/* Main */}
          <div>
            <Section title="Informações da coleção" description="Nome, URL e descrição">
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Nome da coleção</label>
                <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #c9cccf", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Handle (URL)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13, color: "#6d7175" }}>/collections/</span>
                  <input value={editForm.handle} onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })} style={{ flex: 1, padding: "10px 12px", border: "1px solid #c9cccf", borderRadius: 8, fontSize: 14, fontFamily: "monospace", boxSizing: "border-box" }} />
                </div>
              </div>
            </Section>

            {/* Products in collection */}
            <Section title={`Produtos na coleção (${editProducts.length})`} description="Selecione quais produtos pertencem a esta coleção">
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {allProducts.map((product) => {
                  const isIn = editProducts.includes(product.id);
                  return (
                    <label key={product.id} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                      borderRadius: 8, cursor: "pointer", marginBottom: 4,
                      background: isIn ? "#f0fdf4" : "transparent",
                      border: `1px solid ${isIn ? "#bbf7d0" : "transparent"}`,
                    }}>
                      <input type="checkbox" checked={isIn} onChange={() => toggleProduct(product.id)} style={{ width: 18, height: 18 }} />
                      <div style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid #e5e7eb", flexShrink: 0, background: "#f6f6f7" }}>
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: isIn ? 600 : 400, color: "#202223" }}>{product.title}</div>
                        <div style={{ fontSize: 11, color: "#6d7175", fontFamily: "monospace" }}>/product/{product.handle}</div>
                      </div>
                    </label>
                  );
                })}
                {allProducts.length === 0 && (
                  <p style={{ color: "#6d7175", fontSize: 13 }}>Nenhum produto cadastrado.</p>
                )}
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Imagem de capa</h3>
              <ImageUpload label="" value={editForm.imageUrl} onChange={(v) => setEditForm({ ...editForm, imageUrl: v })} token={token || ""} />
            </div>

            <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Resumo</h3>
              <div style={{ fontSize: 12, color: "#6d7175", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Produtos:</span>
                  <strong>{editProducts.length}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Handle:</span>
                  <strong style={{ fontFamily: "monospace" }}>{editForm.handle}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>ID:</span>
                  <code style={{ fontSize: 10 }}>{editing.id}</code>
                </div>
              </div>
            </div>

            <button onClick={handleSaveEdit} disabled={saving} style={{
              width: "100%", padding: "14px", background: "#008060", color: "#fff",
              border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15,
              cursor: saving ? "not-allowed" : "pointer", marginBottom: 8,
            }}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>

            <a href={`/collections/${editing.handle}`} target="_blank" rel="noopener noreferrer" style={{
              display: "block", width: "100%", padding: "12px", textAlign: "center", textDecoration: "none",
              border: "1px solid #c9cccf", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#202223", boxSizing: "border-box",
            }}>
              Ver na loja ↗
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div>
      {msg && (
        <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13, background: msg.type === "success" ? "#f1f8f5" : "#fef3f2", color: msg.type === "success" ? "#1a7346" : "#d72c0d", border: `1px solid ${msg.type === "success" ? "#aee9d1" : "#fead9a"}` }}>
          {msg.type === "success" ? "✓" : "✕"} {msg.text}
        </div>
      )}

      <Section title="Coleções" description="Organize seus produtos em categorias. Cada coleção tem uma página na loja.">
        <div style={{ marginBottom: 16 }}>
          {!showAdd ? (
            <button onClick={() => setShowAdd(true)} style={{ padding: "8px 16px", background: "#008060", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              + Nova coleção
            </button>
          ) : (
            <div style={{ padding: 16, background: "#f9fafb", borderRadius: 10, border: "1px solid #e1e3e5" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Nome da coleção</label>
                  <input value={newCol.title} onChange={(e) => setNewCol({ ...newCol, title: e.target.value, handle: generateHandle(e.target.value) })} placeholder="Ex: Masculino, Outlet" style={{ width: "100%", padding: "8px 12px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 14, boxSizing: "border-box" }} autoFocus />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Handle (URL)</label>
                  <input value={newCol.handle} onChange={(e) => setNewCol({ ...newCol, handle: e.target.value })} placeholder="gerado-automaticamente" style={{ width: "100%", padding: "8px 12px", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 14, fontFamily: "monospace", boxSizing: "border-box" }} />
                </div>
              </div>
              <ImageUpload label="Imagem de capa (opcional)" value={newCol.imageUrl} onChange={(v) => setNewCol({ ...newCol, imageUrl: v })} token={token || ""} />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={handleAdd} style={{ padding: "8px 20px", background: "#008060", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Criar coleção</button>
                <button onClick={() => setShowAdd(false)} style={{ padding: "8px 16px", background: "none", border: "1px solid #c9cccf", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              </div>
            </div>
          )}
        </div>

        {loading ? <p style={{ color: "#6d7175" }}>Carregando...</p> : (
          <div>
            {collections.map((col) => {
              const productCount = allProducts.filter((p) => p.collection_id === col.id).length;
              return (
                <div key={col.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid #f1f1f1" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", border: "1px solid #e1e3e5", flexShrink: 0, background: "#f6f6f7" }}>
                    {col.imageUrl ? (
                      <img src={col.imageUrl} alt={col.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📁</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#202223" }}>{col.title}</div>
                    <div style={{ fontSize: 12, color: "#6d7175", marginTop: 2 }}>
                      /collections/{col.handle} · {productCount} produto{productCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <a href={`/collections/${col.handle}`} target="_blank" rel="noopener noreferrer" title="Ver na loja" style={{ padding: "6px 10px", border: "1px solid #c9cccf", borderRadius: 6, textDecoration: "none", fontSize: 12, color: "#202223" }}>👁</a>
                    <button onClick={() => openEdit(col)} title="Editar" style={{ padding: "6px 10px", border: "1px solid #c9cccf", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer" }}>✏️</button>
                    <button onClick={() => handleDelete(col.id, col.title)} title="Excluir" style={{ padding: "6px 10px", border: "1px solid #fead9a", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer", color: "#d72c0d" }}>🗑</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
