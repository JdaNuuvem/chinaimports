"use client";

import { useState, useEffect } from "react";
import { Section, Field } from "./shared";
import { addAdminLog } from "@/components/admin/ActivityLog";
import ActivityLog from "@/components/admin/ActivityLog";
import EmailPreview from "@/components/admin/EmailPreview";
import ExportData from "@/components/admin/ExportData";

function SecretField({ label, field, helpText, placeholder, value, onChange, isVisible, onToggleVisibility }: {
  label: string; field: string; helpText?: string; placeholder?: string;
  value: string; onChange: (field: string, value: string) => void;
  isVisible: boolean; onToggleVisibility: (field: string) => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#202223" }}>{label}</label>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder || "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
          style={{ flex: 1, padding: "10px 12px", border: "1px solid #c9cccf", borderRadius: 8, fontSize: 14, fontFamily: "monospace", outline: "none" }}
          onFocus={(e) => e.target.style.borderColor = "#005bd3"}
          onBlur={(e) => e.target.style.borderColor = "#c9cccf"}
        />
        <button onClick={() => onToggleVisibility(field)} style={{ padding: "8px 12px", border: "1px solid #c9cccf", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }} title={isVisible ? "Ocultar" : "Mostrar"}>
          {isVisible ? "\uD83D\uDD13" : "\uD83D\uDD12"}
        </button>
      </div>
      {helpText && <p style={{ fontSize: 12, color: "#6d7175", marginTop: 4 }}>{helpText}</p>}
    </div>
  );
}

function ResetData({ backendUrl, token }: { backendUrl: string; token?: string }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    orders: false,
    customers: false,
    carts: false,
    reviews: false,
    newsletters: false,
    coupons: false,
    products: false,
  });
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const labels: Record<string, string> = {
    orders: "Pedidos e itens",
    customers: "Clientes",
    carts: "Carrinhos",
    reviews: "Avaliações",
    newsletters: "Newsletter",
    coupons: "Cupons",
    products: "Produtos (inclui variantes e imagens)",
  };

  const anySelected = Object.values(selected).some(Boolean);

  const handleReset = async () => {
    const targets = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (targets.length === 0) return;

    const names = targets.map((t) => labels[t] || t).join(", ");
    if (!confirm(`ATENÇÃO: Você vai apagar permanentemente: ${names}.\n\nEssa ação NÃO pode ser desfeita. Continuar?`)) return;
    if (!confirm("Tem CERTEZA ABSOLUTA? Todos os dados selecionados serão perdidos.")) return;

    setResetting(true);
    setResult(null);
    try {
      const res = await fetch(`${backendUrl}/admin/reset-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ targets }),
      });
      const data = await res.json();
      if (res.ok) {
        const summary = Object.entries(data.deleted || {}).map(([k, v]) => `${k}: ${v}`).join(", ");
        setResult({ text: `Dados apagados com sucesso! (${summary})`, type: "success" });
        setSelected({ orders: false, customers: false, carts: false, reviews: false, newsletters: false, coupons: false, products: false });
      } else {
        setResult({ text: data.error || "Erro ao apagar dados", type: "error" });
      }
    } catch {
      setResult({ text: "Erro de conexão com o backend", type: "error" });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div>
      <div style={{ background: "#fef3f2", border: "1px solid #fead9a", borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 12, lineHeight: 1.8 }}>
        <strong>Cuidado:</strong> Esta ação apaga dados permanentemente do banco de dados. Selecione apenas o que deseja remover. Recomendamos exportar os dados antes de apagar.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {Object.entries(labels).map(([key, label]) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: `1px solid ${selected[key] ? "#dc2626" : "#e5e7eb"}`, borderRadius: 8, cursor: "pointer", background: selected[key] ? "#fef3f2" : "#fff", fontSize: 13 }}>
            <input
              type="checkbox"
              checked={selected[key]}
              onChange={(e) => setSelected({ ...selected, [key]: e.target.checked })}
              style={{ accentColor: "#dc2626" }}
            />
            {label}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => setSelected({ orders: true, customers: true, carts: true, reviews: true, newsletters: true, coupons: true, products: false })}
          style={{ padding: "8px 16px", border: "1px solid #c9cccf", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
        >
          Selecionar tudo (exceto produtos)
        </button>
        <button
          onClick={handleReset}
          disabled={!anySelected || resetting}
          style={{ padding: "10px 24px", background: anySelected ? "#dc2626" : "#e5e7eb", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: anySelected && !resetting ? "pointer" : "not-allowed" }}
        >
          {resetting ? "Apagando..." : "Apagar dados selecionados"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 12, padding: "10px 16px", borderRadius: 8, fontSize: 13, background: result.type === "success" ? "#f1f8f5" : "#fef3f2", color: result.type === "success" ? "#1a7346" : "#d72c0d", border: `1px solid ${result.type === "success" ? "#aee9d1" : "#fead9a"}` }}>
          {result.text}
        </div>
      )}
    </div>
  );
}

export default function SettingsTab({ backendUrl, token }: { backendUrl: string; token?: string }) {
  const [keys, setKeys] = useState({
    lunaCheckoutUrl: "",
    lunaStoreUuid: "",
    stripePublicKey: "",
    stripeSecretKey: "",
    googleAnalyticsId: "",
    facebookPixelId: "",
    metaApiToken: "",
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    smtpPass: "",
    whatsappNumber: "",
    webhookUrl: `${backendUrl}/webhooks/luna`,
  });
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  // Load saved keys from backend settings (with localStorage fallback for offline)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${backendUrl}/admin/settings?reveal=1`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          const remote: Record<string, string> = {};
          for (const row of data.settings || []) {
            // Map backend keys (SNAKE_CASE) to local (camelCase)
            const mapping: Record<string, string> = {
              LUNA_CHECKOUT_URL: "lunaCheckoutUrl",
              LUNA_STORE_UUID: "lunaStoreUuid",
              STRIPE_PUBLIC_KEY: "stripePublicKey",
              STRIPE_SECRET_KEY: "stripeSecretKey",
              GA_ID: "googleAnalyticsId",
              FB_PIXEL_ID: "facebookPixelId",
              META_API_TOKEN: "metaApiToken",
              SMTP_HOST: "smtpHost",
              SMTP_PORT: "smtpPort",
              SMTP_USER: "smtpUser",
              SMTP_PASS: "smtpPass",
              WHATSAPP_NUMBER: "whatsappNumber",
            };
            const localKey = mapping[row.key];
            if (localKey && typeof row.value === "string") remote[localKey] = row.value;
          }
          if (Object.keys(remote).length > 0) {
            setKeys((prev) => ({ ...prev, ...remote }));
            return;
          }
        }
      } catch { /* fallback below */ }
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem("ua_admin_settings");
        if (saved) setKeys((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch { /* ignore */ }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    // Persist to backend (authoritative)
    const mapping: Record<string, string> = {
      lunaCheckoutUrl: "LUNA_CHECKOUT_URL",
      lunaStoreUuid: "LUNA_STORE_UUID",
      stripePublicKey: "STRIPE_PUBLIC_KEY",
      stripeSecretKey: "STRIPE_SECRET_KEY",
      googleAnalyticsId: "GA_ID",
      facebookPixelId: "FB_PIXEL_ID",
      metaApiToken: "META_API_TOKEN",
      smtpHost: "SMTP_HOST",
      smtpPort: "SMTP_PORT",
      smtpUser: "SMTP_USER",
      smtpPass: "SMTP_PASS",
      whatsappNumber: "WHATSAPP_NUMBER",
    };
    const payload: Record<string, string> = {};
    for (const [localKey, remoteKey] of Object.entries(mapping)) {
      const v = (keys as Record<string, string>)[localKey];
      if (v !== undefined) payload[remoteKey] = v;
    }
    try {
      const res = await fetch(`${backendUrl}/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        // Keep localStorage as mirror for offline edits
        localStorage.setItem("ua_admin_settings", JSON.stringify(keys));
        setMsg({ text: "Configurações salvas no backend!", type: "success" });
      } else {
        setMsg({ text: "Erro ao salvar no backend (mantido local)", type: "error" });
        localStorage.setItem("ua_admin_settings", JSON.stringify(keys));
      }
    } catch {
      setMsg({ text: "Sem conexão — salvo apenas localmente", type: "error" });
      localStorage.setItem("ua_admin_settings", JSON.stringify(keys));
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const toggleShow = (key: string) => setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));

  const updateKey = (field: string, value: string) => setKeys({ ...keys, [field]: value });

  return (
    <div>
      {msg && (
        <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13, background: msg.type === "success" ? "#f1f8f5" : "#fef3f2", color: msg.type === "success" ? "#1a7346" : "#d72c0d", border: `1px solid ${msg.type === "success" ? "#aee9d1" : "#fead9a"}`, display: "flex", alignItems: "center", gap: 8 }}>
          {msg.type === "success" ? "\✓" : "\✕"} {msg.text}
        </div>
      )}

      {/* Luna Checkout */}
      <Section title="Luna Checkout" description="Conecte sua loja ao Luna Checkout para processar pagamentos via PIX, cart\ão, boleto e d\ébito.">
        <div style={{ background: "#f0fdf4", border: "1px solid #aee9d1", borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 12, lineHeight: 1.8 }}>
          <strong>Passo a passo:</strong><br />
          1. Crie sua conta em <a href="https://lunacheckout.com" target="_blank" rel="noopener noreferrer" style={{ color: "#008060", fontWeight: 600 }}>lunacheckout.com</a><br />
          2. Copie a URL do checkout da sua loja<br />
          3. Configure o webhook no painel Luna para: <code style={{ background: "#e1e3e5", padding: "2px 6px", borderRadius: 4 }}>{keys.webhookUrl}</code><br />
          4. Ative todos os eventos de venda e rastreio
        </div>
        <Field label="URL do checkout Luna" value={keys.lunaCheckoutUrl} onChange={(v) => setKeys({ ...keys, lunaCheckoutUrl: v })} helpText="Ex: https://minha-loja.lunacheckout.com" />
        <SecretField label="UUID da loja Luna (opcional)" field="lunaStoreUuid" helpText="Opcional. A Luna não exige UUID na integração via webhook — deixe em branco se sua versão do painel não fornecer este campo." placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (opcional)" value={(keys as Record<string, string>)["lunaStoreUuid"] || ""} onChange={updateKey} isVisible={!!showSecrets["lunaStoreUuid"]} onToggleVisibility={toggleShow} />

        <div style={{ padding: 12, background: "#f6f6f7", borderRadius: 8, fontSize: 12, marginTop: 8 }}>
          <strong>URL do Webhook (copie para o painel Luna):</strong>
          <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
            <code style={{ flex: 1, background: "#fff", border: "1px solid #c9cccf", borderRadius: 6, padding: "8px 12px", fontFamily: "monospace", fontSize: 13 }}>{keys.webhookUrl}</code>
            <button onClick={() => { navigator.clipboard.writeText(keys.webhookUrl); setMsg({ text: "URL copiada!", type: "success" }); setTimeout(() => setMsg(null), 2000); }} style={{ padding: "8px 14px", background: "#008060", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Copiar</button>
          </div>
        </div>
      </Section>

      {/* Stripe (futuro) */}
      <Section title="Stripe" description="Integra\ç\ão com Stripe para pagamentos internacionais (cart\ão de cr\édito). Opcional \— use apenas se n\ão usar Luna.">
        <SecretField label="Chave pública (pk_)" field="stripePublicKey" placeholder="pk_live_..." value={(keys as Record<string, string>)["stripePublicKey"] || ""} onChange={updateKey} isVisible={!!showSecrets["stripePublicKey"]} onToggleVisibility={toggleShow} />
        <SecretField label="Chave secreta (sk_)" field="stripeSecretKey" placeholder="sk_live_..." helpText="Nunca compartilhe esta chave. Ela é armazenada apenas no seu navegador." value={(keys as Record<string, string>)["stripeSecretKey"] || ""} onChange={updateKey} isVisible={!!showSecrets["stripeSecretKey"]} onToggleVisibility={toggleShow} />
      </Section>

      {/* Analytics */}
      <Section title="Analytics e Rastreamento" description="Conecte ferramentas de analytics para acompanhar o tr\áfego e convers\ões da sua loja.">
        <Field label="Google Analytics ID" value={keys.googleAnalyticsId} onChange={(v) => setKeys({ ...keys, googleAnalyticsId: v })} helpText="Ex: G-XXXXXXXXXX ou UA-XXXXXXXXX-X" />
        <Field label="Facebook Pixel ID" value={keys.facebookPixelId} onChange={(v) => setKeys({ ...keys, facebookPixelId: v })} helpText="Ex: 123456789012345" />
        <SecretField label="Meta Conversions API Token" field="metaApiToken" placeholder="EAAxxxxxxx..." helpText="Token para API de Conversões do Facebook/Meta" value={(keys as Record<string, string>)["metaApiToken"] || ""} onChange={updateKey} isVisible={!!showSecrets["metaApiToken"]} onToggleVisibility={toggleShow} />
      </Section>

      {/* Email */}
      <Section title="E-mail (SMTP)" description="Configure para enviar e-mails de confirma\ç\ão de pedido, recupera\ç\ão de carrinho e newsletter.">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <Field label="Host SMTP" value={keys.smtpHost} onChange={(v) => setKeys({ ...keys, smtpHost: v })} helpText="Ex: smtp.gmail.com, smtp.sendgrid.net" />
          <Field label="Porta" value={keys.smtpPort} onChange={(v) => setKeys({ ...keys, smtpPort: v })} helpText="587 (TLS) ou 465 (SSL)" />
        </div>
        <Field label="Usu\ário SMTP" value={keys.smtpUser} onChange={(v) => setKeys({ ...keys, smtpUser: v })} helpText="Geralmente seu e-mail" />
        <SecretField label="Senha SMTP" field="smtpPass" helpText="Senha de aplicativo (não sua senha pessoal)" value={(keys as Record<string, string>)["smtpPass"] || ""} onChange={updateKey} isVisible={!!showSecrets["smtpPass"]} onToggleVisibility={toggleShow} />
      </Section>

      {/* WhatsApp */}
      <Section title="WhatsApp" description="N\úmero para o bot\ão de suporte flutuante na loja.">
        <Field label="N\úmero do WhatsApp" value={keys.whatsappNumber} onChange={(v) => setKeys({ ...keys, whatsappNumber: v })} helpText="Com DDI, ex: 5511999999999" />
      </Section>

      {/* Email Preview */}
      <Section title="Preview de E-mails" description="Visualize como ficam os e-mails antes de ativar o SMTP.">
        <EmailPreview storeName="Imports China Brasil" />
      </Section>

      {/* Export Data */}
      <Section title="Exportar Dados" description="Baixe produtos, pedidos ou clientes em formato CSV.">
        <ExportData backendUrl={backendUrl} token={token} />
      </Section>

      {/* Reset Data */}
      <Section title="Zerar Dados" description="Apague dados da loja. Esta ação é irreversível.">
        <ResetData backendUrl={backendUrl} token={token} />
      </Section>

      {/* Activity Log */}
      <Section title="Log de Atividades" description="Hist\órico de a\ç\ões realizadas nesta sess\ão.">
        <ActivityLog />
      </Section>

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={() => { save(); addAdminLog("Configura\ç\ões", "Chaves API atualizadas"); }} style={{ padding: "12px 32px", background: "#008060", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          Salvar configura\ç\ões
        </button>
      </div>
    </div>
  );
}
