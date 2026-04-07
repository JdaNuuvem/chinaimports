"use client";

import { useState, useEffect, useCallback } from "react";
import { Section, PageHeader, StatusBadge } from "./shared";

interface SentinelConfig {
  secret: string | null;
  api_key: string | null;
  webhook_base: string;
  configured: boolean;
}

interface SentinelTabProps {
  backendUrl: string;
  token?: string;
}

export default function SentinelTab({ backendUrl, token }: SentinelTabProps) {
  const [config, setConfig] = useState<SentinelConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [apiKeyLocal, setApiKeyLocal] = useState("");

  const authHeaders = useCallback((): HeadersInit => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/admin/sentinel/config`, { headers: authHeaders() });
      if (res.ok) {
        const data: SentinelConfig = await res.json();
        setConfig(data);
      } else {
        setMsg({ text: "Falha ao carregar configuração", type: "error" });
      }
    } catch {
      setMsg({ text: "Erro de conexão com o backend", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [backendUrl, authHeaders]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Load api_key from backend settings (authoritative source)
  useEffect(() => {
    if (config?.api_key) setApiKeyLocal(config.api_key);
  }, [config?.api_key]);

  const rotateSecret = async () => {
    if (!confirm("Gerar um novo secret vai invalidar o webhook atual no Sentinel. Deseja continuar?")) return;
    setRotating(true);
    try {
      const res = await fetch(`${backendUrl}/admin/sentinel/rotate-secret`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig((prev) => prev ? { ...prev, secret: data.secret, configured: true } : null);
        setMsg({ text: `Novo secret gerado! Adicione ao .env: SENTINEL_WEBHOOK_SECRET=${data.secret}`, type: "success" });
      } else {
        setMsg({ text: "Falha ao gerar secret", type: "error" });
      }
    } catch {
      setMsg({ text: "Erro de conexão", type: "error" });
    } finally {
      setRotating(false);
    }
  };

  const saveApiKey = async () => {
    try {
      const res = await fetch(`${backendUrl}/admin/settings`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ SENTINEL_API_KEY: apiKeyLocal }),
      });
      if (res.ok) {
        setMsg({ text: "API Key salva! A storefront vai pegar a nova config no próximo request.", type: "success" });
        loadConfig();
      } else {
        setMsg({ text: "Erro ao salvar API Key", type: "error" });
      }
    } catch {
      setMsg({ text: "Erro de conexão", type: "error" });
    }
    setTimeout(() => setMsg(null), 5000);
  };

  const testWebhook = async () => {
    if (!config?.secret) { setTestResult("❌ Configure o secret primeiro"); return; }
    setTestResult("Testando...");
    try {
      const pingRes = await fetch(`${backendUrl}/webhooks/sentinel/${config.secret}/ping`);
      if (!pingRes.ok) {
        setTestResult(`❌ Ping falhou (${pingRes.status})`);
        return;
      }
      const postRes = await fetch(`${backendUrl}/webhooks/sentinel/${config.secret}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "test",
          data: { timestamp: new Date().toISOString(), source: "admin_panel" },
        }),
      });
      if (postRes.ok) {
        setTestResult("✅ Webhook funcionando! Ping e POST retornaram 2xx.");
      } else {
        setTestResult(`❌ POST falhou (${postRes.status})`);
      }
    } catch (e) {
      setTestResult(`❌ Erro: ${(e as Error).message}`);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setMsg({ text: `${label} copiado!`, type: "success" });
    setTimeout(() => setMsg(null), 2000);
  };

  const webhookUrl = config?.secret ? `${config.webhook_base}/${config.secret}` : null;

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Carregando...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Sentinel Tracking"
        subtitle="Rastreamento avançado de conversões com atribuição cross-session"
        actions={<StatusBadge label={config?.configured ? "Configurado" : "Não configurado"} variant={config?.configured ? "success" : "neutral"} />}
      />
      {msg && (
        <div style={{
          padding: "10px 16px",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 13,
          background: msg.type === "success" ? "#f1f8f5" : msg.type === "error" ? "#fef3f2" : "#eff6ff",
          color: msg.type === "success" ? "#1a7346" : msg.type === "error" ? "#d72c0d" : "#1e40af",
          border: `1px solid ${msg.type === "success" ? "#aee9d1" : msg.type === "error" ? "#fead9a" : "#bfdbfe"}`,
          wordBreak: "break-all",
        }}>
          {msg.text}
        </div>
      )}

      <Section title="Sentinel Tracking" description="Tracker de conversões que unifica Meta Ads, Google Ads, TikTok, Kwai — com preservação de UTM cross-session.">
        <div style={{ background: "#f0fdf4", border: "1px solid #aee9d1", borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 12, lineHeight: 1.8 }}>
          <strong>Como configurar:</strong><br />
          1. Crie sua conta em <a href="https://sentineltracking.io" target="_blank" rel="noopener noreferrer" style={{ color: "#008060", fontWeight: 600 }}>sentineltracking.io</a><br />
          2. Copie a API Key (começa com <code>sk_</code>) e cole no campo abaixo → Salvar<br />
          3. Clique em <strong>Gerar Webhook Secret</strong> para criar um endpoint único<br />
          4. Copie a <strong>Webhook URL</strong> gerada e cole no painel do Sentinel<br />
          5. Clique em <strong>Testar webhook</strong> para validar a conexão<br />
          Tudo é salvo no backend — nenhuma configuração em arquivo <code>.env</code>.
        </div>
      </Section>

      {/* API Key */}
      <Section title="API Key (client-side tracker)" description="Chave pública que vai embutida no HTML do storefront.">
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#202223" }}>
          Sentinel API Key
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="text"
            value={apiKeyLocal}
            onChange={(e) => setApiKeyLocal(e.target.value)}
            placeholder="sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            style={{ flex: 1, padding: "10px 12px", border: "1px solid #c9cccf", borderRadius: 8, fontSize: 14, fontFamily: "monospace" }}
          />
          <button
            onClick={saveApiKey}
            style={{ padding: "8px 20px", background: "#008060", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
          >
            Salvar
          </button>
        </div>
        <p style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
          A API Key é salva no backend e o storefront a carrega automaticamente em cada SSR. Não é necessário configurar <code>.env</code>.
        </p>
      </Section>

      {/* Webhook */}
      <Section title="Webhook URL (recebe conversões do Sentinel)" description="URL onde o Sentinel vai postar eventos de conversão validados.">
        {config?.configured && webhookUrl ? (
          <>
            <div style={{ background: "#f6f6f7", border: "1px solid #c9cccf", borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>
                URL do Webhook (cole no painel Sentinel)
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <code style={{ flex: 1, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px", fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" }}>
                  {webhookUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(webhookUrl, "URL")}
                  style={{ padding: "8px 14px", background: "#1a1c1e", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Copiar
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={testWebhook}
                style={{ padding: "10px 20px", background: "#1e40af", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                Testar webhook
              </button>
              <button
                onClick={rotateSecret}
                disabled={rotating}
                style={{ padding: "10px 20px", background: "#fff", color: "#dc2626", border: "1px solid #dc2626", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: rotating ? "wait" : "pointer" }}
              >
                {rotating ? "Gerando..." : "Gerar novo secret"}
              </button>
            </div>

            {testResult && (
              <div style={{
                marginTop: 12,
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                background: testResult.startsWith("✅") ? "#f1f8f5" : "#fef3f2",
                color: testResult.startsWith("✅") ? "#1a7346" : "#d72c0d",
                border: `1px solid ${testResult.startsWith("✅") ? "#aee9d1" : "#fead9a"}`,
              }}>
                {testResult}
              </div>
            )}
          </>
        ) : (
          <div>
            <div style={{ padding: 16, background: "#fef3f2", border: "1px solid #fead9a", borderRadius: 8, marginBottom: 12, fontSize: 13, color: "#d72c0d" }}>
              Webhook ainda não configurado. Clique no botão abaixo para gerar um secret seguro.
            </div>
            <button
              onClick={rotateSecret}
              disabled={rotating}
              style={{ padding: "12px 28px", background: "#008060", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: rotating ? "wait" : "pointer" }}
            >
              {rotating ? "Gerando..." : "Gerar Webhook Secret"}
            </button>
          </div>
        )}
      </Section>

      {/* Eventos rastreados */}
      <Section title="Eventos enviados automaticamente" description="Disparados pelo client-side tracker e helpers em lib/sentinel.ts.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {[
            { name: "view_item", desc: "Ao abrir página de produto" },
            { name: "add_to_cart", desc: "Ao adicionar ao carrinho" },
            { name: "begin_checkout", desc: "Ao entrar no checkout" },
            { name: "purchase", desc: "Ao finalizar pedido" },
            { name: "search", desc: "Ao buscar produtos" },
            { name: "lead", desc: "Ao inscrever na newsletter" },
          ].map((ev) => (
            <div key={ev.name} style={{ padding: "12px 14px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" }}>
              <code style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "2px 6px", borderRadius: 4 }}>{ev.name}</code>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{ev.desc}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
