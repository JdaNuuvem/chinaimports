"use client";

import { useState, useEffect } from "react";
import { Section, PageHeader, KpiCard, ActionButton } from "./shared";
import ImageUpload from "@/components/ImageUpload";

interface AdminVariant {
  id: string; title: string; sku: string | null;
  prices: Array<{ amount: number }>; inventory_quantity: number;
}

interface AdminProduct {
  id: string; title: string; handle: string; description?: string;
  thumbnail: string | null;
  variants: AdminVariant[];
  images: Array<{ id: string; url: string }>;
  options: Array<{ id: string; title: string; values: Array<{ id: string; value: string }> }>;
  luna_checkout_url?: string | null;
  skip_cart?: boolean;
  created_at: string;
}

interface EditableVariant {
  id: string;
  title: string;
  sku: string;
  price: number; // centavos
  compareAtPrice: number;
  inventory: number;
}

interface EditForm {
  title: string;
  handle: string;
  description: string;
  thumbnail: string;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
  lunaCheckoutUrl: string;
  skipCart: boolean;
  variants: EditableVariant[];
  images: string[];
  options: Array<{ title: string; values: string[] }>;
}

const COLOR_HEX_MAP: Record<string, string> = {
  preto: "#000000", branco: "#FFFFFF", azul: "#1e3a8a", "azul marinho": "#1e3a5f",
  "azul royal": "#2563eb", vermelho: "#dc2626", cinza: "#6b7280", "cinza claro": "#d1d5db",
  "cinza escuro": "#374151", verde: "#16a34a", "verde militar": "#4d7c0f", rosa: "#A53954",
  laranja: "#f97316", amarelo: "#eab308", roxo: "#7c3aed", marrom: "#92400e",
  bege: "#d4b896", coral: "#f87171", nude: "#e8c4a2", vinho: "#7f1d1d",
  cáqui: "#a3916a", grafite: "#3f3f46", dourado: "#d4a017", prata: "#c0c0c0",
  bordô: "#800020", turquesa: "#06b6d4", salmão: "#fa8072", oliva: "#808000",
  creme: "#fffdd0", lilás: "#c8a2c8", mostarda: "#e1a71c", terracota: "#cc4e3f",
};

export default function ProductsTab({ backendUrl, token }: { backendUrl: string; token?: string }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);

  const authHeaders: HeadersInit = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };

  const load = () => {
    Promise.resolve().then(() => {
      setLoading(true);
      fetch(`${backendUrl}/admin/products`, { headers: authHeaders })
        .then((r) => r.json())
        .then((d) => { setProducts(d.products || []); setLoading(false); })
        .catch(() => setLoading(false));
    });
  };

  useEffect(() => {
    fetch(`${backendUrl}/admin/products`, { headers: authHeaders })
      .then((r) => r.json())
      .then((d) => { setProducts(d.products || []); setLoading(false); })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir "${title}"? Essa ação não pode ser desfeita.`)) return;
    const res = await fetch(`${backendUrl}/admin/products/${id}`, { method: "DELETE", headers: authHeaders });
    if (res.ok) { setMsg({ text: `"${title}" excluído`, type: "success" }); load(); }
    else setMsg({ text: "Erro ao excluir", type: "error" });
  };

  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setEditForm({
      title: p.title,
      handle: p.handle,
      description: p.description || "",
      thumbnail: p.thumbnail || "",
      isFeatured: false,
      metaTitle: "",
      metaDescription: "",
      lunaCheckoutUrl: p.luna_checkout_url || "",
      skipCart: p.skip_cart === true,
      variants: p.variants.map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku || "",
        price: v.prices[0]?.amount || 0,
        compareAtPrice: 0,
        inventory: v.inventory_quantity,
      })),
      images: p.images.map((img) => img.url),
      options: p.options.map((opt) => ({
        title: opt.title,
        values: opt.values.map((v) => v.value),
      })),
    });
  };

  const handleSaveEdit = async () => {
    if (!editing || !editForm) return;
    setSaving(true);

    // Save product info
    const res = await fetch(`${backendUrl}/admin/products/${editing.id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        title: editForm.title,
        description: editForm.description,
        thumbnail: editForm.thumbnail || null,
        isFeatured: editForm.isFeatured,
        metaTitle: editForm.metaTitle || null,
        metaDescription: editForm.metaDescription || null,
        lunaCheckoutUrl: editForm.lunaCheckoutUrl?.trim() || null,
        skipCart: editForm.skipCart === true,
      }),
    });

    // Save variant stock/price updates individually
    for (const variant of editForm.variants) {
      await fetch(`${backendUrl}/admin/products/${editing.id}/variants/${variant.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          price: variant.price,
          compareAtPrice: variant.compareAtPrice || null,
          inventoryQuantity: variant.inventory,
          sku: variant.sku || null,
        }),
      }).catch(() => {});
    }

    setSaving(false);
    if (res.ok) { setMsg({ text: "Produto atualizado com sucesso!", type: "success" }); setEditing(null); setEditForm(null); load(); }
    else setMsg({ text: "Erro ao atualizar produto", type: "error" });
  };

  const updateVariant = (index: number, field: keyof EditableVariant, value: string | number) => {
    if (!editForm) return;
    const variants = [...editForm.variants];
    variants[index] = { ...variants[index], [field]: value };
    setEditForm({ ...editForm, variants });
  };

  const addImage = (url: string) => {
    if (!editForm || !url) return;
    setEditForm({ ...editForm, images: [...editForm.images, url] });
  };

  const removeImage = (index: number) => {
    if (!editForm) return;
    setEditForm({ ...editForm, images: editForm.images.filter((_, i) => i !== index) });
  };

  const addOptionValue = (optIndex: number, value: string) => {
    if (!editForm || !value.trim()) return;
    const options = [...editForm.options];
    options[optIndex] = { ...options[optIndex], values: [...options[optIndex].values, value.trim()] };
    setEditForm({ ...editForm, options });
  };

  const removeOptionValue = (optIndex: number, valIndex: number) => {
    if (!editForm) return;
    const options = [...editForm.options];
    options[optIndex] = { ...options[optIndex], values: options[optIndex].values.filter((_, i) => i !== valIndex) };
    setEditForm({ ...editForm, options });
  };

  const renameOption = (optIndex: number, title: string) => {
    if (!editForm) return;
    const options = [...editForm.options];
    options[optIndex] = { ...options[optIndex], title };
    setEditForm({ ...editForm, options });
  };

  const removeOption = (optIndex: number) => {
    if (!editForm) return;
    setEditForm({ ...editForm, options: editForm.options.filter((_, i) => i !== optIndex) });
  };

  const addOption = () => {
    if (!editForm) return;
    setEditForm({ ...editForm, options: [...editForm.options, { title: "Novo Atributo", values: [] }] });
  };

  const totalStock = products.reduce((s, p) => s + p.variants.reduce((vs, v) => vs + v.inventory_quantity, 0), 0);

  const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#374151" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #c9cccf", borderRadius: 8, fontSize: 14, boxSizing: "border-box" as const };
  const smallInputStyle: React.CSSProperties = { ...inputStyle, padding: "8px 10px", fontSize: 13 };

  // ── EDIT VIEW ──
  if (editing && editForm) {
    return (
      <div>
        <button onClick={() => { setEditing(null); setEditForm(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6d7175", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
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
            {/* Info */}
            <Section title="Informações do produto" description="Título, descrição e detalhes">
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Título</label>
                <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Handle (URL)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13, color: "#6d7175" }}>/product/</span>
                  <input value={editForm.handle} onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Descrição</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={6} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
            </Section>

            {/* Variants — EDITABLE */}
            <Section title={`Variantes (${editForm.variants.length})`} description="Edite preço, estoque e SKU de cada variante">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {editForm.variants.map((v, i) => (
                  <div key={v.id} style={{ background: "#f9fafb", borderRadius: 10, padding: 16, border: "1px solid #e5e7eb" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: "#202223" }}>
                      {v.title}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ ...labelStyle, fontSize: 11 }}>Preço (R$)</label>
                        <input
                          type="number"
                          value={(v.price / 100).toFixed(2)}
                          onChange={(e) => updateVariant(i, "price", Math.round(Number(e.target.value) * 100))}
                          step="0.01"
                          min="0"
                          style={smallInputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: 11 }}>Preço comparado (R$)</label>
                        <input
                          type="number"
                          value={v.compareAtPrice > 0 ? (v.compareAtPrice / 100).toFixed(2) : ""}
                          onChange={(e) => updateVariant(i, "compareAtPrice", Math.round(Number(e.target.value) * 100))}
                          step="0.01"
                          min="0"
                          placeholder="Opcional"
                          style={smallInputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: 11 }}>Estoque</label>
                        <input
                          type="number"
                          value={v.inventory}
                          onChange={(e) => updateVariant(i, "inventory", Number(e.target.value))}
                          min="0"
                          style={{
                            ...smallInputStyle,
                            borderColor: v.inventory <= 0 ? "#fecaca" : v.inventory <= 5 ? "#fde68a" : "#c9cccf",
                            background: v.inventory <= 0 ? "#fef2f2" : v.inventory <= 5 ? "#fffbeb" : "#fff",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: 11 }}>SKU</label>
                        <input
                          value={v.sku}
                          onChange={(e) => updateVariant(i, "sku", e.target.value)}
                          style={smallInputStyle}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Options — EDITABLE */}
            <Section title="Opções / Atributos" description="Tamanho, cor e outros atributos do produto">
              {editForm.options.map((opt, optIdx) => {
                const isColor = /cor|color|colour/i.test(opt.title);
                return (
                  <div key={optIdx} style={{ marginBottom: 16, background: "#f9fafb", borderRadius: 10, padding: 16, border: "1px solid #e5e7eb" }}>
                    {/* Option header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <input
                        value={opt.title}
                        onChange={(e) => renameOption(optIdx, e.target.value)}
                        style={{ fontWeight: 700, fontSize: 14, border: "none", background: "transparent", color: "#202223", padding: 0, outline: "none", borderBottom: "1px dashed #c9cccf" }}
                      />
                      <button onClick={() => { if (confirm(`Remover atributo "${opt.title}"?`)) removeOption(optIdx); }} style={{ fontSize: 11, color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
                        Remover atributo
                      </button>
                    </div>

                    {/* Values */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      {opt.values.map((val, valIdx) => {
                        if (isColor) {
                          const hex = COLOR_HEX_MAP[val.toLowerCase()] || "#9ca3af";
                          return (
                            <div key={valIdx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: hex,
                                border: hex === "#FFFFFF" || hex === "#ffffff" ? "2px solid #d1d5db" : "2px solid transparent",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                cursor: "default",
                              }} title={val} />
                              <span style={{ fontSize: 10, color: "#6d7175" }}>{val}</span>
                              <button
                                onClick={() => removeOptionValue(optIdx, valIdx)}
                                style={{
                                  position: "absolute", top: -4, right: -4,
                                  width: 16, height: 16, borderRadius: "50%",
                                  background: "#dc2626", color: "#fff",
                                  border: "none", cursor: "pointer", fontSize: 10,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  lineHeight: 1,
                                }}
                              >×</button>
                            </div>
                          );
                        }
                        return (
                          <span key={valIdx} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, background: "#fff" }}>
                            {val}
                            <button onClick={() => removeOptionValue(optIdx, valIdx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                          </span>
                        );
                      })}
                    </div>

                    {/* Add value */}
                    <div style={{ display: "flex", gap: 6 }}>
                      {isColor ? (
                        <>
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                addOptionValue(optIdx, e.target.value);
                                e.target.value = "";
                              }
                            }}
                            style={{ ...smallInputStyle, flex: 1 }}
                          >
                            <option value="">Selecionar cor...</option>
                            {Object.keys(COLOR_HEX_MAP).filter((c) => !opt.values.some((v) => v.toLowerCase() === c)).map((color) => (
                              <option key={color} value={color.charAt(0).toUpperCase() + color.slice(1)}>
                                {color.charAt(0).toUpperCase() + color.slice(1)}
                              </option>
                            ))}
                          </select>
                          <input
                            placeholder="Ou digite uma cor..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                                addOptionValue(optIdx, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }}
                            style={{ ...smallInputStyle, width: 140 }}
                          />
                        </>
                      ) : (
                        <>
                          <input
                            placeholder={`Novo valor de ${opt.title}...`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                addOptionValue(optIdx, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }}
                            style={{ ...smallInputStyle, flex: 1 }}
                          />
                          <button
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                              if (input?.value) { addOptionValue(optIdx, input.value); input.value = ""; }
                            }}
                            style={{ padding: "8px 14px", background: "#008060", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                          >
                            +
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add new attribute */}
              <button
                onClick={addOption}
                style={{
                  width: "100%", padding: "12px",
                  border: "2px dashed #c9cccf", borderRadius: 10,
                  background: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 600, color: "#008060",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                + Adicionar novo atributo
              </button>
            </Section>

            {/* Images — EDITABLE */}
            <Section title={`Imagens (${editForm.images.length})`} description="Arraste para reordenar, clique × para remover">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                {editForm.images.map((url, i) => (
                  <div key={i} style={{ position: "relative", width: 100, height: 100, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      onClick={() => removeImage(i)}
                      style={{
                        position: "absolute", top: 4, right: 4,
                        width: 22, height: 22, borderRadius: "50%",
                        background: "rgba(0,0,0,0.6)", color: "#fff",
                        border: "none", cursor: "pointer", fontSize: 12,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                    {i === 0 && (
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,128,96,0.8)", color: "#fff", fontSize: 9, textAlign: "center", padding: 2 }}>
                        Principal
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <ImageUpload
                label="Adicionar imagem"
                value=""
                onChange={(url) => addImage(url)}
                token={token || ""}
              />
            </Section>

            {/* SEO */}
            <Section title="SEO" description="Meta tags para motores de busca">
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Meta título</label>
                <input value={editForm.metaTitle} onChange={(e) => setEditForm({ ...editForm, metaTitle: e.target.value })} placeholder={editForm.title} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Meta descrição</label>
                <textarea value={editForm.metaDescription} onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })} rows={2} placeholder="Descrição para SEO (max 160 caracteres)" maxLength={160} style={{ ...inputStyle, resize: "vertical" }} />
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{editForm.metaDescription.length}/160</p>
              </div>
            </Section>

            {/* Checkout */}
            <Section title="Checkout" description="Sobrescreve o botão Comprar Agora deste produto">
              <div>
                <label style={labelStyle}>URL checkout Luna</label>
                <input
                  type="url"
                  value={editForm.lunaCheckoutUrl}
                  onChange={(e) => setEditForm({ ...editForm, lunaCheckoutUrl: e.target.value })}
                  placeholder="https://checkout.lunacheckout.com/..."
                  style={inputStyle}
                />
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  Se preenchido, o botão &quot;Comprar Agora&quot; deste produto vai redirecionar diretamente para esta URL em vez de adicionar ao carrinho. <strong>O carrinho é sempre pulado quando a URL Luna está preenchida.</strong>
                </p>
              </div>
              <div style={{ marginTop: 12 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    cursor: editForm.lunaCheckoutUrl ? "not-allowed" : "pointer",
                    fontSize: 13,
                    opacity: editForm.lunaCheckoutUrl ? 0.6 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editForm.skipCart || !!editForm.lunaCheckoutUrl}
                    disabled={!!editForm.lunaCheckoutUrl}
                    onChange={(e) => setEditForm({ ...editForm, skipCart: e.target.checked })}
                    style={{ marginTop: 2 }}
                  />
                  <span>
                    <strong>Pular carrinho ao comprar</strong>
                    <br />
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>
                      Quando ativado, o botão &quot;Comprar Agora&quot; adiciona o item e leva o cliente direto pro checkout, sem abrir o mini-carrinho. (Forçado quando há URL Luna acima.)
                    </span>
                  </span>
                </label>
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Imagem principal</h3>
              <ImageUpload label="" value={editForm.thumbnail} onChange={(v) => setEditForm({ ...editForm, thumbnail: v })} token={token || ""} />
            </div>

            <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Status</h3>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                <input type="checkbox" checked={editForm.isFeatured} onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })} />
                Produto em destaque
              </label>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Resumo</h3>
              <div style={{ fontSize: 12, color: "#6d7175", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Variantes:</span>
                  <strong>{editForm.variants.length}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Estoque total:</span>
                  <strong style={{ color: editForm.variants.reduce((s, v) => s + v.inventory, 0) < 10 ? "#dc2626" : "#202223" }}>
                    {editForm.variants.reduce((s, v) => s + v.inventory, 0)}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Menor preço:</span>
                  <strong>R$ {(Math.min(...editForm.variants.map((v) => v.price)) / 100).toFixed(2).replace(".", ",")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Imagens:</span>
                  <strong>{editForm.images.length}</strong>
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e1e3e5", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Informações</h3>
              <div style={{ fontSize: 12, color: "#6d7175" }}>
                <p><strong>Handle:</strong> {editing.handle}</p>
                <p><strong>ID:</strong> <code style={{ fontSize: 10 }}>{editing.id}</code></p>
                <p><strong>Criado em:</strong> {new Date(editing.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>

            <button onClick={handleSaveEdit} disabled={saving} style={{
              width: "100%", padding: "14px", background: "#008060", color: "#fff",
              border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15,
              cursor: saving ? "not-allowed" : "pointer", marginBottom: 8,
            }}>
              {saving ? "Salvando..." : "Salvar todas as alterações"}
            </button>

            <a href={`/product/${editing.handle}`} target="_blank" rel="noopener noreferrer" style={{
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
      <PageHeader
        title="Produtos"
        subtitle="Gerencie o catálogo da sua loja"
        actions={
          <>
            <ActionButton variant="secondary">Exportar CSV</ActionButton>
            <ActionButton variant="secondary">Importar</ActionButton>
            <ActionButton variant="primary">+ Novo Produto</ActionButton>
          </>
        }
      />

      {msg && (
        <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13, background: msg.type === "success" ? "#f1f8f5" : "#fef3f2", color: msg.type === "success" ? "#1a7346" : "#d72c0d", border: `1px solid ${msg.type === "success" ? "#aee9d1" : "#fead9a"}` }}>
          {msg.type === "success" ? "✓" : "✕"} {msg.text}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Produtos" value={products.length} />
        <KpiCard label="Variantes" value={products.reduce((s, p) => s + p.variants.length, 0)} />
        <KpiCard
          label="Estoque total"
          value={totalStock}
          trendDirection={totalStock < 20 ? "down" : "up"}
          subLabel={totalStock < 20 ? "estoque baixo" : "em estoque"}
        />
      </div>

      <Section title="Todos os produtos" description={`${products.length} produtos cadastrados na sua loja`}>
        {loading ? <p style={{ color: "#6d7175" }}>Carregando...</p> : (
          <div>
            {products.map((p) => (
              <div key={p.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f1f1f1" }}>
                <div style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", border: "1px solid #e1e3e5", flexShrink: 0, background: "#f6f6f7" }}>
                  {p.thumbnail ? <img src={p.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 20 }}>📦</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#202223" }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "#6d7175", marginTop: 2 }}>
                    {p.variants.length} variante{p.variants.length !== 1 ? "s" : ""} · {p.variants.reduce((s, v) => s + v.inventory_quantity, 0)} em estoque · R$ {((p.variants[0]?.prices[0]?.amount || 0) / 100).toFixed(2)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <a href={`/product/${p.handle}`} target="_blank" rel="noopener noreferrer" title="Ver na loja" style={{ padding: "6px 10px", border: "1px solid #c9cccf", borderRadius: 6, textDecoration: "none", fontSize: 12, color: "#202223", cursor: "pointer" }}>👁</a>
                  <button onClick={() => openEdit(p)} title="Editar" style={{ padding: "6px 10px", border: "1px solid #c9cccf", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer" }}>✏️</button>
                  <button onClick={() => handleDelete(p.id, p.title)} title="Excluir" style={{ padding: "6px 10px", border: "1px solid #fead9a", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer", color: "#d72c0d" }}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
