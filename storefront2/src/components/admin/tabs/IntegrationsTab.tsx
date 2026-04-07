"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader, IntegrationCard, ActionButton } from "./shared";

interface IntegrationsTabProps {
  backendUrl: string;
  token?: string;
  onNavigate?: (tab: string) => void;
}

interface IntegrationSettings {
  LUNA_CHECKOUT_URL?: string;
  LUNA_STORE_UUID?: string;
  SENTINEL_API_KEY?: string;
  SENTINEL_WEBHOOK_SECRET?: string;
  GA_ID?: string;
  FB_PIXEL_ID?: string;
  META_API_TOKEN?: string;
  SMTP_HOST?: string;
  STRIPE_SECRET_KEY?: string;
}

export default function IntegrationsTab({ backendUrl, token, onNavigate }: IntegrationsTabProps) {
  const [settings, setSettings] = useState<IntegrationSettings>({});
  const [loading, setLoading] = useState(true);

  const authHeaders = useCallback((): HeadersInit => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/admin/settings?reveal=1`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        const map: IntegrationSettings = {};
        for (const row of data.settings || []) {
          if (typeof row.value === "string") {
            (map as Record<string, string>)[row.key] = row.value;
          }
        }
        setSettings(map);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [backendUrl, authHeaders]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const isLunaActive = !!(settings.LUNA_CHECKOUT_URL || settings.LUNA_STORE_UUID);
  const isSentinelActive = !!(settings.SENTINEL_API_KEY && settings.SENTINEL_WEBHOOK_SECRET);
  const isGaActive = !!settings.GA_ID;
  const isMetaActive = !!settings.FB_PIXEL_ID;
  const isSmtpActive = !!settings.SMTP_HOST;
  const isStripeActive = !!settings.STRIPE_SECRET_KEY;

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>Carregando integrações...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Integrações"
        subtitle="Conecte sua loja com plataformas de pagamento, marketing e analytics"
      />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
        gap: 16,
      }}>
        {/* Luna Checkout */}
        <IntegrationCard
          name="LunaCheckout"
          description="Checkout externo com PIX, cartão e boleto. Vendas aprovadas são registradas automaticamente via webhook. Comissão: 6,99% por venda."
          status={isLunaActive ? "active" : "inactive"}
          icon={<span style={{ fontSize: 20 }}>🌙</span>}
        >
          <ul style={{ margin: "0 0 14px 0", padding: "0 0 0 18px", fontSize: 12, color: "#6d7175", lineHeight: 1.7 }}>
            <li>Registro automático de vendas via webhook</li>
            <li>PIX, Cartão de Crédito e Boleto</li>
            <li>Integração com painel de tracking</li>
          </ul>
          <div style={{ display: "flex", gap: 6 }}>
            <ActionButton variant="success" onClick={() => onNavigate?.("settings")}>
              Configurar
            </ActionButton>
          </div>
        </IntegrationCard>

        {/* Sentinel Tracking */}
        <IntegrationCard
          name="Sentinel Tracking"
          description="Rastreamento avançado de conversões e atribuição para redes de anúncios. O SDK captura page_view, add_to_cart, checkout e purchase com parâmetros UTM para atribuição server-side."
          status={isSentinelActive ? "active" : "inactive"}
          icon={<span style={{ fontSize: 20 }}>🛰️</span>}
        >
          <ul style={{ margin: "0 0 14px 0", padding: "0 0 0 18px", fontSize: 12, color: "#6d7175", lineHeight: 1.7 }}>
            <li>Eventos: view_item, add_to_cart, begin_checkout, purchase</li>
            <li>Atribuição de conversões no front-end</li>
            <li>Compatível com Meta, Google Ads, TikTok, Kwai</li>
            <li>Cookieless com preservação de tracking</li>
          </ul>
          <div style={{ display: "flex", gap: 6 }}>
            <ActionButton variant="success" onClick={() => onNavigate?.("sentinel")}>
              {isSentinelActive ? "Gerenciar" : "Configurar"}
            </ActionButton>
          </div>
        </IntegrationCard>

        {/* Google Analytics */}
        <IntegrationCard
          name="Google Analytics 4"
          description="Rastreamento de visitas, comportamento e conversões. Dashboard no console do Google com dados em tempo real."
          status={isGaActive ? "active" : "inactive"}
          icon={<span style={{ fontSize: 20 }}>📊</span>}
        >
          <ul style={{ margin: "0 0 14px 0", padding: "0 0 0 18px", fontSize: 12, color: "#6d7175", lineHeight: 1.7 }}>
            <li>Mede tráfego, sessões e engajamento</li>
            <li>Ecommerce tracking (view_item, add_to_cart, purchase)</li>
            <li>Configure o ID <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: 3 }}>G-XXXXXXXX</code></li>
          </ul>
          <ActionButton variant="secondary" onClick={() => onNavigate?.("settings")}>
            Configurar
          </ActionButton>
        </IntegrationCard>

        {/* Meta Pixel */}
        <IntegrationCard
          name="Meta Pixel (Facebook)"
          description="Pixel oficial do Meta para campanhas de Facebook e Instagram Ads. Envia conversões para otimização automática."
          status={isMetaActive ? "active" : "inactive"}
          icon={<span style={{ fontSize: 20 }}>📘</span>}
        >
          <ul style={{ margin: "0 0 14px 0", padding: "0 0 0 18px", fontSize: 12, color: "#6d7175", lineHeight: 1.7 }}>
            <li>Pixel ID de 15 dígitos</li>
            <li>Eventos padrão + custom events</li>
            <li>Opcional: Conversions API token para server-side</li>
          </ul>
          <ActionButton variant="secondary" onClick={() => onNavigate?.("settings")}>
            Configurar
          </ActionButton>
        </IntegrationCard>

        {/* SMTP / Email */}
        <IntegrationCard
          name="E-mail SMTP"
          description="Envio de e-mails transacionais: confirmação de pedido, recuperação de carrinho e newsletter."
          status={isSmtpActive ? "active" : "inactive"}
          icon={<span style={{ fontSize: 20 }}>✉️</span>}
        >
          <ul style={{ margin: "0 0 14px 0", padding: "0 0 0 18px", fontSize: 12, color: "#6d7175", lineHeight: 1.7 }}>
            <li>Provedores: Gmail, SendGrid, Mailgun, Amazon SES</li>
            <li>TLS 587 ou SSL 465</li>
            <li>Templates prontos para e-commerce</li>
          </ul>
          <ActionButton variant="secondary" onClick={() => onNavigate?.("settings")}>
            Configurar
          </ActionButton>
        </IntegrationCard>

        {/* Stripe */}
        <IntegrationCard
          name="Stripe"
          description="Gateway de pagamento internacional para cartão de crédito. Opcional — use apenas se não usar Luna."
          status={isStripeActive ? "active" : "inactive"}
          icon={<span style={{ fontSize: 20 }}>💳</span>}
        >
          <ul style={{ margin: "0 0 14px 0", padding: "0 0 0 18px", fontSize: 12, color: "#6d7175", lineHeight: 1.7 }}>
            <li>Cartões Visa, Master, Amex, Elo</li>
            <li>Webhooks automáticos</li>
            <li>Disputas e chargebacks via dashboard Stripe</li>
          </ul>
          <ActionButton variant="secondary" onClick={() => onNavigate?.("settings")}>
            Configurar
          </ActionButton>
        </IntegrationCard>
      </div>

      {/* Info banner */}
      <div style={{
        marginTop: 24,
        padding: "14px 18px",
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: 10,
        fontSize: 13,
        color: "#1e40af",
        lineHeight: 1.6,
      }}>
        <strong>💡 Dica:</strong> Todas as chaves API são armazenadas no backend e carregadas no storefront em cada request. Você não precisa editar arquivos <code>.env</code> — basta salvar no formulário de configuração.
      </div>
    </div>
  );
}
