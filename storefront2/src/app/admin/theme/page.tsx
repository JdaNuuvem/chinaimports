"use client";

import React, { useState, useEffect, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import { LayoutDashboard, ClipboardList, Settings, Monitor, Store, Palette, Type, Navigation, PanelBottom, Megaphone, Home, Package, ShoppingCart, Mail, Search, Globe, Tags, FolderOpen, Star, Download } from "lucide-react";
import type { ThemeConfig } from "@/lib/theme-config";
import ImageUpload from "@/components/ImageUpload";
import SectionEditor from "@/components/admin/VisualEditor/SectionEditor";
import StoreStatus from "@/components/admin/StoreStatus";
import NotificationBadge from "@/components/admin/NotificationBadge";
import GlobalSearch from "@/components/admin/GlobalSearch";
import DarkModeToggle from "@/components/admin/DarkModeToggle";
import KeyboardShortcuts from "@/components/admin/KeyboardShortcuts";
import { addAdminLog } from "@/components/admin/ActivityLog";
import NewVisualEditor from "@/components/admin/VisualEditor";

// Extracted tab components
import DashboardTab from "@/components/admin/tabs/DashboardTab";
import OrdersTab from "@/components/admin/tabs/OrdersTab";
import ProductsTab from "@/components/admin/tabs/ProductsTab";
import CollectionsTab from "@/components/admin/tabs/CollectionsTab";
import ColorsTab from "@/components/admin/tabs/ColorsTab";
import TypographyTab from "@/components/admin/tabs/TypographyTab";
import SettingsTab from "@/components/admin/tabs/SettingsTab";
import SentinelTab from "@/components/admin/tabs/SentinelTab";
import IntegrationsTab from "@/components/admin/tabs/IntegrationsTab";
import TransactionsTab from "@/components/admin/tabs/TransactionsTab";
import NotificationsTab from "@/components/admin/tabs/NotificationsTab";
import { NavBadge } from "@/components/admin/tabs/shared";

// Shared helper components
import {
  Section,
  Field,
  TextAreaField,
  ColorField,
  CheckboxField,
  SelectField,
  NumberField,
  SaveButton,
} from "@/components/admin/tabs/shared";

type Tab = "identity" | "colors" | "typography" | "header" | "footer" | "announcement" | "home" | "product" | "cart" | "newsletter" | "seo" | "reviews" | "import-products" | "i18n" | "products-list" | "collections-list" | "dashboard" | "orders-list" | "visual-editor" | "settings" | "sentinel" | "integrations" | "transactions" | "notifications" | "popups";

interface TabGroup {
  label: string;
  tabs: { id: Tab; label: string; icon: ReactNode; desc: string; badge?: { label: string; variant: "info" | "success" | "warning" | "neutral" } }[];
}

const IC = { size: 18, strokeWidth: 1.8 };

const TAB_GROUPS: TabGroup[] = [
  {
    label: "Visão Geral",
    tabs: [
      { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard {...IC} />, desc: "Vendas, acessos e métricas" },
      { id: "orders-list", label: "Pedidos", icon: <ClipboardList {...IC} />, desc: "Gerenciar pedidos" },
      { id: "transactions", label: "Transações", icon: <ClipboardList {...IC} />, desc: "Pagamentos e recebimentos", badge: { label: "NEW", variant: "info" } },
      { id: "notifications", label: "Notificações", icon: <Megaphone {...IC} />, desc: "Alertas e atualizações", badge: { label: "NEW", variant: "info" } },
    ],
  },
  {
    label: "Integrações",
    tabs: [
      { id: "integrations", label: "Integrações", icon: <Settings {...IC} />, desc: "Luna, Sentinel, Pixel, GA", badge: { label: "NEW", variant: "info" } },
      { id: "sentinel", label: "Sentinel", icon: <Settings {...IC} />, desc: "Webhook + eventos de tracking" },
      { id: "settings", label: "Configurações", icon: <Settings {...IC} />, desc: "Chaves API e SMTP" },
    ],
  },
  {
    label: "Aparência",
    tabs: [
      { id: "visual-editor", label: "Editor Visual", icon: <Monitor {...IC} />, desc: "Editar vendo a loja" },
      { id: "identity", label: "Identidade", icon: <Store {...IC} />, desc: "Logo, nome e favicon" },
      { id: "colors", label: "Cores", icon: <Palette {...IC} />, desc: "Paleta de cores da loja" },
      { id: "typography", label: "Tipografia", icon: <Type {...IC} />, desc: "Fontes e tamanhos" },
    ],
  },
  {
    label: "Layout",
    tabs: [
      { id: "header", label: "Navegação", icon: <Navigation {...IC} />, desc: "Menu e links do topo" },
      { id: "footer", label: "Rodapé", icon: <PanelBottom {...IC} />, desc: "Links e redes sociais" },
      { id: "announcement", label: "Barra de Anúncio", icon: <Megaphone {...IC} />, desc: "Banner promocional" },
      { id: "home", label: "Página Inicial", icon: <Home {...IC} />, desc: "Seções e ordem" },
    ],
  },
  {
    label: "Loja",
    tabs: [
      { id: "product", label: "Produto", icon: <Package {...IC} />, desc: "Exibição e variantes" },
      { id: "cart", label: "Carrinho", icon: <ShoppingCart {...IC} />, desc: "Tipo e frete grátis" },
      { id: "newsletter", label: "Newsletter", icon: <Mail {...IC} />, desc: "Captura de e-mails" },
      { id: "popups", label: "Pop-ups", icon: <Megaphone {...IC} />, desc: "Boas-vindas, exit-intent" },
      { id: "seo", label: "SEO", icon: <Search {...IC} />, desc: "Título e meta tags" },
      { id: "i18n", label: "Idiomas & Moedas", icon: <Globe {...IC} />, desc: "Multi-idioma e câmbio" },
    ],
  },
  {
    label: "Catálogo",
    tabs: [
      { id: "products-list", label: "Produtos", icon: <Tags {...IC} />, desc: "Listar, editar e remover" },
      { id: "collections-list", label: "Coleções", icon: <FolderOpen {...IC} />, desc: "Gerenciar categorias" },
    ],
  },
  {
    label: "Ferramentas",
    tabs: [
      { id: "reviews", label: "Avaliações", icon: <Star {...IC} />, desc: "Importar e gerenciar" },
      { id: "import-products", label: "Importar Produtos", icon: <Download {...IC} />, desc: "Shopee e Mercado Livre" },
    ],
  },
];

const ALL_TABS = TAB_GROUPS.flatMap((g) => g.tabs);

// Legacy compat removed — TABS was unused

export default function ThemeAdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [nextToken, setNextToken] = useState("");
  const [config, setConfig] = useState<ThemeConfig | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [saving, setSaving] = useState(false);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

  // Load config
  useEffect(() => {
    fetch("/api/theme-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => setMessage({ text: "Erro ao carregar configuração", type: "error" }));
  }, []);

  // Check for saved token on mount — validate against backend
  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    const expiry = localStorage.getItem("admin_token_expiry");
    const savedNext = localStorage.getItem("admin_next_token");
    if (saved && expiry && Date.now() < Number(expiry)) {
      fetch(`${backendUrl}/admin/stats`, { headers: { Authorization: `Bearer ${saved}` } })
        .then((r) => {
          if (r.ok) {
            setToken(saved);
            if (savedNext) setNextToken(savedNext);
            setAuthenticated(true);
          } else {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_token_expiry");
          }
        })
        .catch(() => {
          // Backend not reachable, still allow login with saved token
          setToken(saved);
          if (savedNext) setNextToken(savedNext);
          setAuthenticated(true);
        });
    }
  }, [backendUrl]);

  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      // Authenticate with Next.js API (for theme config)
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Erro ao autenticar");
        return;
      }

      // Also authenticate with backend (for admin stats/CRUD)
      const nextJwt = data.token;
      let backendToken = data.token;
      try {
        const backendRes = await fetch(`${backendUrl}/admin/auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        if (backendRes.ok) {
          const backendData = await backendRes.json();
          backendToken = backendData.token;
        }
      } catch {
        // Backend auth failed, use Next.js token as fallback
      }

      setToken(backendToken);
      setNextToken(nextJwt);
      setAuthenticated(true);
      localStorage.setItem("admin_token", backendToken);
      localStorage.setItem("admin_next_token", nextJwt);
      localStorage.setItem("admin_token_expiry", String(Date.now() + data.expiresIn * 1000));
    } catch {
      setLoginError("Erro de conexão");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setToken("");
    setNextToken("");
    setPassword("");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_next_token");
    localStorage.removeItem("admin_token_expiry");
  };

  const saveConfig = async (updates: Partial<ThemeConfig>) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/theme-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${nextToken || token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const err = await res.json();
        setMessage({ text: err.error || "Erro ao salvar", type: "error" });
        return;
      }
      const { config: updated } = await res.json();
      setConfig(updated);
      setMessage({ text: "Configuração salva com sucesso!", type: "success" });
      addAdminLog("Tema", "Configuração atualizada");
    } catch {
      setMessage({ text: "Erro de conexão ao salvar", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof ThemeConfig>(
    section: K,
    field: string,
    value: unknown
  ) => {
    // Use functional setState so rapid successive calls (e.g. applying a
    // color preset that updates 9 fields in a forEach) compose correctly.
    // Reading `config` from closure here would make each call see the
    // stale snapshot and only the last field would survive.
    setConfig((prev) => {
      if (!prev) return prev;
      const sectionData = prev[section];
      if (typeof sectionData !== "object" || sectionData === null) return prev;
      return {
        ...prev,
        [section]: { ...sectionData, [field]: value },
      };
    });
  };

  // ── Admin-only shell (hides store header/footer via CSS) ──
  const adminShell = (
    <style dangerouslySetInnerHTML={{ __html: `
      .Evolution--v1 > header, .Evolution--v1 > .announcement-bar, .Evolution--v1 > section,
      .Evolution--v1 > footer, .Evolution--v1 > #barra-newsletter, .Evolution--v1 > .posicao-rodape,
      .Evolution--v1 > button[aria-label], .Evolution--v1 > [role="alert"],
      .Evolution--v1 > div:has(> .announcement-bar), .Evolution--v1 > div:has(> .footer),
      .Evolution--v1 > div:has(> .newsletter), .Evolution--v1 > div:has(> button[aria-label="Voltar ao topo"]),
      .Evolution--v1 > div:has(> button[aria-label="Fechar"]),
      .Evolution--v1 > div:has(> p:first-child):last-of-type {
        display: none !important;
      }
      #main { padding: 0 !important; margin: 0 !important; }
      body { background: var(--admin-bg, #f8f9fb) !important; }
    `}} />
  );

  if (!authenticated) {
    return (
      <>
        {adminShell}
        <div className="admin-login">
          <div className="admin-login__card">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div className="admin-login__logo">UA</div>
              <h1 className="admin-login__title">Painel Administrativo</h1>
              <p className="admin-login__subtitle">Entre com sua senha para acessar</p>
            </div>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label className="admin-field__label">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha de administrador"
                  className="admin-login__input"
                  autoFocus
                />
              </div>
              {loginError && (
                <p className="admin-login__error">{loginError}</p>
              )}
              <button type="submit" disabled={loginLoading} className="admin-login__btn">
                {loginLoading ? "Autenticando..." : "Entrar"}
              </button>
            </form>
            <div className="admin-login__footer">
              <Link href="/">← Voltar para a loja</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!config) return (
    <>
      {adminShell}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #1e2d7d", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#888" }}>Carregando painel...</p>
          <style dangerouslySetInnerHTML={{ __html: "@keyframes spin { to { transform: rotate(360deg) } }" }} />
        </div>
      </div>
    </>
  );

  const currentTab = ALL_TABS.find((t) => t.id === activeTab);

  return (
    <>
      {adminShell}
      <div className="admin-panel" style={{ display: "flex", minHeight: "100vh", gap: 0 }}>
        {/* Sidebar */}
        <nav className="admin-sidebar">
          {/* Logo */}
          <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Link href="/" className="admin-sidebar__brand" style={{ textDecoration: "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "#00badb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, letterSpacing: 1 }}>UA</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{config.identity.storeName}</div>
                <div style={{ fontSize: 10, opacity: 0.5, marginTop: 1 }}>Painel de administração</div>
              </div>
            </Link>
          </div>

          {/* Nav groups */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {TAB_GROUPS.map((group) => (
              <div key={group.label} style={{ marginBottom: 4 }}>
                <div style={{ padding: "10px 20px 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.35)" }}>
                  {group.label}
                </div>
                {group.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", textAlign: "left",
                      padding: "8px 20px", border: "none", cursor: "pointer",
                      background: activeTab === tab.id ? "rgba(0,186,219,0.15)" : "transparent",
                      color: activeTab === tab.id ? "#00badb" : "rgba(255,255,255,0.65)",
                      fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                      borderLeft: activeTab === tab.id ? "2px solid #00badb" : "2px solid transparent",
                      transition: "all 0.12s",
                    }}
                    onMouseEnter={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: activeTab === tab.id ? 1 : 0.7 }}>{tab.icon}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ lineHeight: 1.3, display: "flex", alignItems: "center" }}>
                        {tab.label}
                        {tab.badge && <NavBadge label={tab.badge.label} variant={tab.badge.variant} />}
                      </div>
                      {activeTab !== tab.id && <div style={{ fontSize: 10, opacity: 0.45, lineHeight: 1.2, marginTop: 1 }}>{tab.desc}</div>}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Footer — user card + logout (Trampofy-style) */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #00badb, #0ea5e9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0,
              }}>
                AD
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Admin
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
                  Online
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sair"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: 6,
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(220, 38, 38, 0.2)"; e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.4)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
            <Link href="/" style={{ display: "block", textAlign: "center", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 11, marginTop: 8, padding: "4px 0" }}>
              ← Ver loja
            </Link>
          </div>
        </nav>

        {/* Main content */}
        <main className="admin-main" style={{ flex: 1, overflow: "auto" }}>
          {/* Top bar */}
          <div className="admin-topbar">
            <div>
              <h1 className="admin-topbar__title">
                {currentTab?.label}
              </h1>
              <StoreStatus backendUrl={backendUrl} />
            </div>
            <div className="admin-topbar__actions">
              <GlobalSearch backendUrl={backendUrl} token={token} onNavigate={setActiveTab as (tab: string) => void} />
              <NotificationBadge backendUrl={backendUrl} token={token} onClick={() => setActiveTab("orders-list")} />
              <DarkModeToggle />
              <a href="/" target="_blank" rel="noopener noreferrer" className="admin-topbar__btn admin-topbar__btn--primary" style={{ textDecoration: "none" }}>
                Ver loja ↗
              </a>
              <button onClick={handleLogout} className="admin-topbar__btn admin-topbar__btn--danger">
                Sair
              </button>
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <KeyboardShortcuts onNavigate={setActiveTab as (tab: string) => void} />

          {/* Content area */}
          <div className="admin-content">
            {message && (
              <div style={{
                padding: "12px 20px", marginBottom: 20, borderRadius: 8,
                background: message.type === "success" ? "#f1f8f5" : "#fef3f2",
                color: message.type === "success" ? "#1a7346" : "#d72c0d",
                border: `1px solid ${message.type === "success" ? "#aee9d1" : "#fead9a"}`,
                display: "flex", alignItems: "center", gap: 10, fontSize: 13,
              }}>
                <span>{message.type === "success" ? "✓" : "✕"}</span>
                {message.text}
          </div>
        )}

        {/* ── Extracted tab components ── */}

        {activeTab === "dashboard" && (
          <DashboardTab backendUrl={backendUrl} token={token} />
        )}

        {activeTab === "orders-list" && (
          <OrdersTab backendUrl={backendUrl} token={token} />
        )}

        {activeTab === "settings" && (
          <SettingsTab backendUrl={backendUrl} token={token} />
        )}

        {activeTab === "sentinel" && (
          <SentinelTab backendUrl={backendUrl} token={token} />
        )}

        {activeTab === "integrations" && (
          <IntegrationsTab backendUrl={backendUrl} token={token} onNavigate={(t) => setActiveTab(t as Tab)} />
        )}

        {activeTab === "transactions" && (
          <TransactionsTab backendUrl={backendUrl} token={token} />
        )}

        {activeTab === "notifications" && (
          <NotificationsTab backendUrl={backendUrl} token={token} />
        )}

        {activeTab === "visual-editor" && config && (
          <NewVisualEditor config={config} onSave={saveConfig} saving={saving} token={token} backendUrl={backendUrl} />
        )}

        {activeTab === "colors" && (
          <ColorsTab config={config} saving={saving} onSave={saveConfig} updateField={updateField} />
        )}

        {activeTab === "typography" && (
          <TypographyTab config={config} saving={saving} onSave={saveConfig} updateField={updateField} />
        )}

        {activeTab === "products-list" && (
          <ProductsTab backendUrl={backendUrl} token={token} />
        )}

        {activeTab === "collections-list" && (
          <CollectionsTab backendUrl={backendUrl} token={token} />
        )}

        {/* ── Inline tabs (kept in main file) ── */}

        {activeTab === "identity" && (
          <Section title="Identidade da Loja" description="Defina o nome, logo e favicon da sua loja. O logo aparece no cabeçalho de todas as páginas.">
            <Field label="Nome da loja" value={config.identity.storeName} onChange={(v) => updateField("identity", "storeName", v)} />
            <Field label="Texto do logo" value={config.identity.logoText} onChange={(v) => updateField("identity", "logoText", v)} />
            <ImageUpload label="Logo da loja" value={config.identity.logoUrl || ""} onChange={(v) => updateField("identity", "logoUrl", v || null)} token={token} previewSize={60} />
            <NumberField label="Altura da logo no header (px)" value={config.identity.logoHeight || 40} min={20} max={200} onChange={(v) => updateField("identity", "logoHeight", v)} />
            <ImageUpload label="Favicon" value={config.identity.faviconUrl || ""} onChange={(v) => updateField("identity", "faviconUrl", v || null)} token={token} previewSize={48} />
            <SaveButton saving={saving} onClick={() => saveConfig({ identity: config.identity })} />
          </Section>
        )}

        {activeTab === "announcement" && (
          <Section title="Barra de Anúncio">
            <CheckboxField label="Ativada" checked={config.announcementBar.enabled} onChange={(v) => updateField("announcementBar", "enabled", v)} />
            <Field label="Texto" value={config.announcementBar.text} onChange={(v) => updateField("announcementBar", "text", v)} />
            <Field label="URL do link" value={config.announcementBar.linkUrl || ""} onChange={(v) => updateField("announcementBar", "linkUrl", v || null)} />
            <Field label="Texto do link" value={config.announcementBar.linkText || ""} onChange={(v) => updateField("announcementBar", "linkText", v || null)} />
            <SaveButton saving={saving} onClick={() => saveConfig({ announcementBar: config.announcementBar })} />
          </Section>
        )}

        {activeTab === "header" && (
          <Section title="Navegação do Header">
            <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
              Links de navegação principal. Edite o título e URL de cada link.
            </p>
            {config.header.navLinks.map((link, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input
                  value={link.title}
                  onChange={(e) => {
                    const updated = [...config.header.navLinks];
                    updated[i] = { ...updated[i], title: e.target.value };
                    setConfig({ ...config, header: { ...config.header, navLinks: updated } });
                  }}
                  placeholder="Título"
                  style={{ flex: 1, padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
                />
                <input
                  value={link.href}
                  onChange={(e) => {
                    const updated = [...config.header.navLinks];
                    updated[i] = { ...updated[i], href: e.target.value };
                    setConfig({ ...config, header: { ...config.header, navLinks: updated } });
                  }}
                  placeholder="/collections/..."
                  style={{ flex: 1, padding: 8, border: "1px solid #ddd", borderRadius: 4 }}
                />
                <button
                  onClick={() => {
                    const updated = config.header.navLinks.filter((_, idx) => idx !== i);
                    setConfig({ ...config, header: { ...config.header, navLinks: updated } });
                  }}
                  style={{ padding: "8px 12px", background: "#e22120", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const updated = [...config.header.navLinks, { title: "Novo link", href: "/" }];
                setConfig({ ...config, header: { ...config.header, navLinks: updated } });
              }}
              style={{ padding: "8px 16px", background: "#1e2d7d", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", marginTop: 8 }}
            >
              + Adicionar link
            </button>
            <SaveButton saving={saving} onClick={() => saveConfig({ header: config.header })} />
          </Section>
        )}

        {activeTab === "footer" && (
          <Section title="Footer">
            <Field label="Texto de copyright" value={config.footer.copyrightText} onChange={(v) => updateField("footer", "copyrightText", v)} />
            <CheckboxField label="Mostrar newsletter" checked={config.footer.showNewsletter} onChange={(v) => updateField("footer", "showNewsletter", v)} />
            <h4 style={{ marginTop: 20, marginBottom: 10 }}>Redes sociais</h4>
            {(Object.keys(config.footer.socialLinks) as Array<keyof typeof config.footer.socialLinks>).map((key) => (
              <Field key={key} label={key} value={config.footer.socialLinks[key] || ""} onChange={(v) => {
                setConfig({
                  ...config,
                  footer: {
                    ...config.footer,
                    socialLinks: { ...config.footer.socialLinks, [key]: v || undefined },
                  },
                });
              }} />
            ))}
            <SaveButton saving={saving} onClick={() => saveConfig({ footer: config.footer })} />
          </Section>
        )}

        {activeTab === "product" && (
          <Section title="Configurações de Produto">
            <CheckboxField label="Mostrar vendedor" checked={config.product.showVendor} onChange={(v) => updateField("product", "showVendor", v)} />
            <CheckboxField label="Imagem secundária no hover" checked={config.product.showSecondaryImage} onChange={(v) => updateField("product", "showSecondaryImage", v)} />
            <CheckboxField label="Mostrar desconto" checked={config.product.showDiscount} onChange={(v) => updateField("product", "showDiscount", v)} />
            <SelectField label="Formato do desconto" value={config.product.discountMode} options={[{ value: "percentage", label: "Porcentagem" }, { value: "saving", label: "Economia" }]} onChange={(v) => updateField("product", "discountMode", v)} />
            <SelectField label="Posição do preço" value={config.product.pricePosition} options={[{ value: "before_title", label: "Antes do título" }, { value: "after_title", label: "Depois do título" }]} onChange={(v) => updateField("product", "pricePosition", v)} />
            <SelectField label="Tamanho da imagem" value={config.product.imageSize} options={[{ value: "natural", label: "Natural" }, { value: "short", label: "Curta (4:3)" }, { value: "square", label: "Quadrada (1:1)" }, { value: "tall", label: "Alta (2:3)" }]} onChange={(v) => updateField("product", "imageSize", v)} />
            <CheckboxField label="Mostrar estoque" checked={config.product.showInventoryQuantity} onChange={(v) => updateField("product", "showInventoryQuantity", v)} />
            <NumberField label="Limite de estoque baixo" value={config.product.lowInventoryThreshold} min={0} max={100} onChange={(v) => updateField("product", "lowInventoryThreshold", v)} />
            <SaveButton saving={saving} onClick={() => saveConfig({ product: config.product })} />
          </Section>
        )}

        {activeTab === "cart" && (
          <>
            <Section title="Carrinho" description="Configure o comportamento do carrinho e frete grátis">
              <SelectField label="Tipo de carrinho" value={config.cart.type} options={[{ value: "drawer", label: "Drawer (lateral)" }, { value: "page", label: "Página" }, { value: "message", label: "Mensagem" }]} onChange={(v) => updateField("cart", "type", v)} />
              <CheckboxField label="Mostrar botão checkout" checked={config.cart.showCheckoutButton} onChange={(v) => updateField("cart", "showCheckoutButton", v)} />
              <CheckboxField label="Mostrar frete grátis" checked={config.cart.showFreeShippingThreshold} onChange={(v) => updateField("cart", "showFreeShippingThreshold", v)} />
              <NumberField label="Valor mínimo frete grátis (R$)" value={config.cart.freeShippingThreshold / 100} min={0} max={1000} onChange={(v) => updateField("cart", "freeShippingThreshold", Math.round(v * 100))} />
              <Field label="Link do botão carrinho vazio" value={config.cart.emptyButtonLink} onChange={(v) => updateField("cart", "emptyButtonLink", v)} />
              <SaveButton saving={saving} onClick={() => saveConfig({ cart: config.cart })} />
            </Section>

            <Section title="Luna Checkout" description="Integre com o Luna Checkout para pagamentos via PIX, cartão, boleto e débito. Os pedidos são sincronizados automaticamente via webhook.">
              <div style={{ background: "#f0fdf4", border: "1px solid #aee9d1", borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 13 }}>
                <strong>Como configurar:</strong>
                <ol style={{ margin: "8px 0 0 20px", lineHeight: 2 }}>
                  <li>Crie sua loja no <a href="https://lunacheckout.com" target="_blank" rel="noopener noreferrer" style={{ color: "#008060", fontWeight: 600 }}>Luna Checkout</a></li>
                  <li>Cole a URL do seu checkout Luna abaixo</li>
                  <li>No painel da Luna, configure o webhook para: <code style={{ background: "#e1e3e5", padding: "2px 6px", borderRadius: 4 }}>{typeof window !== "undefined" ? window.location.origin : "https://sua-loja.com"}/api/webhooks/luna</code></li>
                  <li>Ative todos os eventos de venda e rastreio</li>
                </ol>
              </div>

              <Field
                label="URL do checkout Luna"
                value={(config as unknown as Record<string, Record<string, string>>).checkout?.lunaCheckoutUrl || ""}
                onChange={(v) => {
                  const checkout = { ...((config as unknown as Record<string, unknown>).checkout as Record<string, string> || {}), lunaCheckoutUrl: v, provider: v ? "luna" : "internal" };
                  saveConfig({ checkout } as Partial<ThemeConfig>);
                }}
                helpText="Ex: https://minha-loja.lunacheckout.com — Quando preenchido, o checkout redireciona para a Luna"
              />

              <div style={{ marginTop: 12, padding: 12, background: "#f6f6f7", borderRadius: 8, fontSize: 12 }}>
                <strong>Webhook URL (copie e cole no painel Luna):</strong>
                <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center" }}>
                  <code style={{ flex: 1, background: "#fff", border: "1px solid #c9cccf", borderRadius: 6, padding: "8px 12px", fontFamily: "monospace", fontSize: 13 }}>
                    {backendUrl}/webhooks/luna
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${backendUrl}/webhooks/luna`);
                      setMessage({ text: "URL copiada!", type: "success" });
                    }}
                    style={{ padding: "8px 14px", background: "#008060", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 16, fontSize: 12, color: "#6d7175" }}>
                <strong>Eventos suportados:</strong> sale_approved, sale_pending, sale_waiting_payment, sale_refused, sale_chargeback, sale_refunded, sale_cancelled, sale_cart_abandoned, sale_cart_recovered, tracking_posted, tracking_in_transit, tracking_out_for_delivery, tracking_delivered, tracking_cancelled, tracking_returned
              </div>
            </Section>
          </>
        )}

        {activeTab === "newsletter" && (
          <Section title="Newsletter">
            <CheckboxField label="Ativada" checked={config.newsletter.enabled} onChange={(v) => updateField("newsletter", "enabled", v)} />
            <Field label="Título" value={config.newsletter.title} onChange={(v) => updateField("newsletter", "title", v)} />
            <Field label="Subtítulo" value={config.newsletter.subtitle} onChange={(v) => updateField("newsletter", "subtitle", v)} />
            <ColorField label="Cor de fundo" value={config.newsletter.backgroundColor} onChange={(v) => updateField("newsletter", "backgroundColor", v)} />
            <ColorField label="Cor do texto" value={config.newsletter.textColor} onChange={(v) => updateField("newsletter", "textColor", v)} />
            <SaveButton saving={saving} onClick={() => saveConfig({ newsletter: config.newsletter })} />
          </Section>
        )}

        {activeTab === "popups" && (() => {
          const popups = config.popups || {
            firstPurchase: { enabled: true, headline: "Ganhe 10% OFF na primeira compra", subheadline: "Cadastre seu e-mail e receba o cupom direto no seu inbox.", discountLabel: "10% OFF", submitLabel: "Quero meu cupom", successMessage: "Pronto! Confira seu e-mail.", delaySeconds: 15 },
            exitIntent: { enabled: true, headline: "Espera! Antes de ir...", subheadline: "Aproveite 10% de desconto em qualquer produto agora.", couponCode: "VOLTA10", activationDelaySeconds: 10 },
            newsletter: { enabled: false, headline: "Receba ofertas exclusivas", subheadline: "Cadastre-se para não perder nenhum lançamento.", submitLabel: "Cadastrar", delaySeconds: 30 },
          };
          const updatePopup = <K extends keyof NonNullable<typeof config.popups>>(key: K, patch: Partial<NonNullable<typeof config.popups>[K]>) => {
            const next = { ...popups, [key]: { ...popups[key], ...patch } };
            setConfig({ ...config, popups: next });
          };
          return (
            <>
              <Section title="Pop-up de boas-vindas (primeira visita)" description="Aparece após X segundos para visitantes novos. Captura e-mails em troca de um cupom.">
                <CheckboxField label="Ativado" checked={popups.firstPurchase.enabled} onChange={(v) => updatePopup("firstPurchase", { enabled: v })} />
                <Field label="Headline" value={popups.firstPurchase.headline} onChange={(v) => updatePopup("firstPurchase", { headline: v })} />
                <Field label="Subtítulo" value={popups.firstPurchase.subheadline} onChange={(v) => updatePopup("firstPurchase", { subheadline: v })} />
                <Field label="Selo de desconto (badge superior)" value={popups.firstPurchase.discountLabel} onChange={(v) => updatePopup("firstPurchase", { discountLabel: v })} />
                <Field label="Texto do botão" value={popups.firstPurchase.submitLabel} onChange={(v) => updatePopup("firstPurchase", { submitLabel: v })} />
                <Field label="Mensagem de sucesso" value={popups.firstPurchase.successMessage} onChange={(v) => updatePopup("firstPurchase", { successMessage: v })} />
                <NumberField label="Atraso para abrir (segundos)" value={popups.firstPurchase.delaySeconds} min={0} max={600} onChange={(v) => updatePopup("firstPurchase", { delaySeconds: v })} />
                <SaveButton saving={saving} onClick={() => saveConfig({ popups: config.popups })} />
              </Section>

              <Section title="Pop-up de saída (exit-intent)" description="Aparece quando o visitante move o mouse pra fechar a aba. Mostra um cupom de retenção.">
                <CheckboxField label="Ativado" checked={popups.exitIntent.enabled} onChange={(v) => updatePopup("exitIntent", { enabled: v })} />
                <Field label="Headline" value={popups.exitIntent.headline} onChange={(v) => updatePopup("exitIntent", { headline: v })} />
                <Field label="Subtítulo" value={popups.exitIntent.subheadline} onChange={(v) => updatePopup("exitIntent", { subheadline: v })} />
                <Field label="Código do cupom" value={popups.exitIntent.couponCode} onChange={(v) => updatePopup("exitIntent", { couponCode: v.toUpperCase() })} />
                <NumberField label="Atraso de ativação (segundos)" value={popups.exitIntent.activationDelaySeconds} min={0} max={600} onChange={(v) => updatePopup("exitIntent", { activationDelaySeconds: v })} />
                <SaveButton saving={saving} onClick={() => saveConfig({ popups: config.popups })} />
              </Section>
            </>
          );
        })()}

        {activeTab === "seo" && (
          <Section title="SEO">
            <Field label="Template do título" value={config.seo.titleTemplate} onChange={(v) => updateField("seo", "titleTemplate", v)} />
            <p style={{ fontSize: 12, color: "#888", marginTop: -8, marginBottom: 12 }}>Use {"{{page}}"} para o nome da página. Ex: {"{{page}} | Imports China Brasil"}</p>
            <TextAreaField label="Descrição padrão" value={config.seo.defaultDescription} onChange={(v) => updateField("seo", "defaultDescription", v)} />
            <SaveButton saving={saving} onClick={() => saveConfig({ seo: config.seo })} />
          </Section>
        )}

        {activeTab === "home" && (
          <Section title="Seções da Home">
            <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
              Ative/desative seções da página inicial. A ordem segue a lista abaixo.
            </p>
            {config.homeSections.map((section, i) => (
              <React.Fragment key={section.id}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", marginBottom: editingSectionIndex === i ? 0 : 8,
                  background: "#fff", borderRadius: 4, border: "1px solid #ddd",
                }}>
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={(e) => {
                      const updated = [...config.homeSections];
                      updated[i] = { ...updated[i], enabled: e.target.checked };
                      setConfig({ ...config, homeSections: updated });
                    }}
                  />
                  <span style={{ flex: 1, fontWeight: 500, cursor: "pointer" }} onClick={() => setEditingSectionIndex(editingSectionIndex === i ? null : i)}>
                    {section.type} <span style={{ color: "#888", fontWeight: 400 }}>({section.id})</span>
                  </span>
                  <button
                    onClick={() => setEditingSectionIndex(editingSectionIndex === i ? null : i)}
                    style={{ padding: "4px 10px", border: "1px solid #008060", borderRadius: 4, cursor: "pointer", background: editingSectionIndex === i ? "#008060" : "#fff", color: editingSectionIndex === i ? "#fff" : "#008060", fontSize: 12, fontWeight: 600 }}
                  >
                    {editingSectionIndex === i ? "Fechar" : "Editar"}
                  </button>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      disabled={i === 0}
                      onClick={() => {
                        const updated = [...config.homeSections];
                        [updated[i - 1], updated[i]] = [updated[i], updated[i - 1]];
                        setConfig({ ...config, homeSections: updated });
                      }}
                      style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? 0.3 : 1, background: "#fff" }}
                    >
                      ↑
                    </button>
                    <button
                      disabled={i === config.homeSections.length - 1}
                      onClick={() => {
                        const updated = [...config.homeSections];
                        [updated[i], updated[i + 1]] = [updated[i + 1], updated[i]];
                        setConfig({ ...config, homeSections: updated });
                      }}
                      style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, cursor: i === config.homeSections.length - 1 ? "default" : "pointer", opacity: i === config.homeSections.length - 1 ? 0.3 : 1, background: "#fff" }}
                    >
                      ↓
                    </button>
                  </div>
                </div>
                {editingSectionIndex === i && (
                  <div style={{ marginBottom: 12 }}>
                    <SectionEditor
                      section={section}
                      index={i}
                      config={config}
                      onSave={saveConfig}
                      onUpdateSettings={(settings) => {
                        const updated = [...config.homeSections];
                        updated[i] = { ...updated[i], settings: { ...updated[i].settings, ...settings } };
                        setConfig({ ...config, homeSections: updated });
                      }}
                      onClose={() => setEditingSectionIndex(null)}
                      token={token}
                      saving={saving}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
            <SaveButton saving={saving} onClick={() => saveConfig({ homeSections: config.homeSections })} />
          </Section>
        )}

        {activeTab === "import-products" && (
          <ProductImporter backendUrl={backendUrl} token={token} />
        )}

        {activeTab === "i18n" && (
          <Section title="Idiomas & Moedas">
            <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
              A loja suporta múltiplos idiomas e moedas. O visitante pode trocar idioma e moeda no rodapé da loja.
            </p>
            <h4 style={{ marginBottom: 10, marginTop: 20 }}>Idiomas disponíveis</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[
                { id: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷", status: "Completo — 120+ chaves traduzidas" },
                { id: "en", label: "English", flag: "🇺🇸", status: "Completo — 120+ chaves traduzidas" },
                { id: "es", label: "Español", flag: "🇪🇸", status: "Completo — 120+ chaves traduzidas" },
              ].map((lang) => (
                <div key={lang.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", border: "1px solid #ddd", borderRadius: 6 }}>
                  <span style={{ fontSize: 24 }}>{lang.flag}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600 }}>{lang.label}</span>
                    <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>{lang.id}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#28a745", fontWeight: 500 }}>{lang.status}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
              Para adicionar um novo idioma, crie um arquivo JSON em <code>src/data/locales/CODIGO.json</code> seguindo o formato dos existentes.
            </p>

            <h4 style={{ marginBottom: 10, marginTop: 20 }}>Moedas disponíveis</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[
                { code: "BRL", symbol: "R$", name: "Real Brasileiro", rate: "1.00 (base)" },
                { code: "USD", symbol: "$", name: "Dólar Americano", rate: "0.18" },
                { code: "EUR", symbol: "€", name: "Euro", rate: "0.17" },
              ].map((cur) => (
                <div key={cur.code} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#fff", border: "1px solid #ddd", borderRadius: 6 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, width: 40 }}>{cur.symbol}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600 }}>{cur.name}</span>
                    <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>{cur.code}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "#555" }}>Taxa: {cur.rate}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#888" }}>
              As taxas de câmbio são configuráveis em <code>src/context/LocaleContext.tsx</code> no array SUPPORTED_CURRENCIES.
              Preços são armazenados em BRL (centavos) e convertidos automaticamente.
            </p>
          </Section>
        )}

        {activeTab === "reviews" && (
          <ReviewsManager backendUrl={backendUrl} token={token} />
        )}
          </div>
        </main>
      </div>
    </>
  );
}

// ══════════════════════════════════════
// PRODUCT IMPORTER (Shopee / ML)
// ══════════════════════════════════════

interface ScrapedProduct {
  title: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  images: string[];
  specs: Array<{ key: string; value: string }>;
  brand: string;
  variantNames: string[];
  variants?: Array<{ name: string; price: number; stock: number }>;
  tierVariations?: Array<{ name: string; options: string[] }>;
  source: string;
  sourceUrl: string;
  rating?: number;
  sold?: number;
  note?: string;
}

function ProductImporter({ backendUrl, token }: { backendUrl: string; token: string }) {
  const [url, setUrl] = useState("");
  const [scraped, setScraped] = useState<ScrapedProduct | null>(null);
  const [scraping, setScraping] = useState(false);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<{ text: string; type: "info" | "success" | "error" | "warning" } | null>(null);
  const [collections, setCollections] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [downloadImages, setDownloadImages] = useState(true);

  // Editable fields
  const [editTitle, setEditTitle] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editComparePrice, setEditComparePrice] = useState(0);
  const [editVariants, setEditVariants] = useState<Array<{ name: string; price: number; stock: number }>>([]);

  // Load collections
  useEffect(() => {
    fetch(`${backendUrl}/store/collections`).then((r) => r.json()).then((d) => setCollections(d.collections || [])).catch(() => {});
  }, [backendUrl]);

  const handleScrape = async () => {
    if (!url.trim()) { setStatus({ text: "Cole a URL do produto", type: "error" }); return; }
    setScraping(true);
    setScraped(null);
    setStatus({ text: "Extraindo dados do produto...", type: "warning" });

    try {
      const res = await fetch(`${backendUrl}/admin/scrape-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setStatus({ text: data.error || "Erro ao extrair", type: "error" });
        setScraping(false);
        return;
      }

      const p = data.product;
      setScraped(p);
      setEditTitle(p.title || "");
      setEditHandle(p.title ? p.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) : "");
      setEditDescription(p.description || "");
      setEditPrice(p.price || 0);
      setEditComparePrice(p.originalPrice || 0);
      setEditVariants(p.variants?.length > 0 ? p.variants : [{ name: "Padrão", price: p.price || 0, stock: 50 }]);

      setStatus({
        text: `Produto extraído: "${p.title}" — ${p.images?.length || 0} imagens. Edite e importe abaixo.`,
        type: "success",
      });
    } catch (err) {
      setStatus({ text: `Erro: ${(err as Error).message}`, type: "error" });
    } finally {
      setScraping(false);
    }
  };

  const handleImport = async () => {
    if (!editTitle) { setStatus({ text: "Título é obrigatório", type: "error" }); return; }
    setImporting(true);
    setStatus({ text: "Importando produto...", type: "warning" });

    try {
      const res = await fetch(`${backendUrl}/admin/import-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: editTitle,
          handle: editHandle,
          description: editDescription,
          price: editPrice,
          originalPrice: editComparePrice || null,
          images: scraped?.images || [],
          variants: editVariants,
          collectionIds: selectedCollections,
          downloadImages,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setStatus({ text: data.error || "Erro ao importar", type: "error" });
      } else {
        setStatus({ text: `Produto "${editTitle}" importado com sucesso! ID: ${data.product?.id}`, type: "success" });
        setScraped(null);
        setUrl("");
      }
    } catch (err) {
      setStatus({ text: `Erro: ${(err as Error).message}`, type: "error" });
    } finally {
      setImporting(false);
    }
  };

  const fieldStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4, fontSize: 13 };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, marginBottom: 3, color: "#555" };

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 20, color: "#1e2d7d" }}>Importar Produtos</h2>

      {status && (
        <div style={{ padding: "10px 16px", borderRadius: 6, marginBottom: 12, fontSize: 13, background: status.type === "success" ? "#d4edda" : status.type === "error" ? "#f8d7da" : status.type === "warning" ? "#fff3cd" : "#e7f3ff", color: status.type === "success" ? "#155724" : status.type === "error" ? "#721c24" : status.type === "warning" ? "#856404" : "#1e5f9a" }}>
          {status.text}
        </div>
      )}

      {/* Extension banner */}
      <ExtensionBanner type="produto" />

      {/* URL Input */}
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Importar da Shopee / Mercado Livre</h3>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>Cole a URL de um produto para extrair título, preço, imagens, variantes e descrição automaticamente.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://shopee.com.br/... ou https://www.mercadolivre.com.br/..." style={{ ...fieldStyle, flex: 1, fontSize: 14 }} />
          <button onClick={handleScrape} disabled={scraping} style={{ padding: "10px 24px", background: "#1e2d7d", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: scraping ? "default" : "pointer", opacity: scraping ? 0.6 : 1, whiteSpace: "nowrap" }}>
            {scraping ? "Extraindo..." : "Extrair Produto"}
          </button>
        </div>
      </div>

      {/* Scraped product editor */}
      {scraped && (
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Editar antes de importar</h3>

          {scraped.note && <p style={{ fontSize: 12, color: "#856404", background: "#fff3cd", padding: 8, borderRadius: 4, marginBottom: 12 }}>{scraped.note}</p>}

          {/* Images preview — removable */}
          {scraped.images.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Imagens ({scraped.images.length}) — clique no × para remover</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {scraped.images.map((img, i) => (
                  <div key={i} style={{ position: "relative", width: 90, height: 90 }}>
                    <img src={img} alt="" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: i === 0 ? "3px solid #1e2d7d" : "1px solid #ddd" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <button onClick={() => { scraped.images.splice(i, 1); setScraped({ ...scraped }); }} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#dc2626", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>
                    {i === 0 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(30,45,125,0.8)", color: "#fff", fontSize: 8, textAlign: "center", padding: 2, borderRadius: "0 0 8px 8px" }}>Capa</div>}
                  </div>
                ))}
              </div>
              <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
                <input type="checkbox" checked={downloadImages} onChange={(e) => setDownloadImages(e.target.checked)} />
                Baixar imagens para o servidor (recomendado)
              </label>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Título *</label>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Handle (URL slug)</label>
              <input value={editHandle} onChange={(e) => setEditHandle(e.target.value)} style={{ ...fieldStyle, fontFamily: "monospace" }} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Descrição</label>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} style={{ ...fieldStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Preço (R$)</label>
              <input type="number" step="0.01" min="0" value={(editPrice / 100).toFixed(2)} onChange={(e) => setEditPrice(Math.round(Number(e.target.value) * 100))} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Preço original / comparação (R$)</label>
              <input type="number" step="0.01" min="0" value={editComparePrice > 0 ? (editComparePrice / 100).toFixed(2) : ""} onChange={(e) => setEditComparePrice(Math.round(Number(e.target.value) * 100))} placeholder="Opcional" style={fieldStyle} />
            </div>
          </div>

          {/* Variants */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Variantes</label>
            {editVariants.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 10, fontWeight: 600, color: "#888" }}>
                <span style={{ flex: 2 }}>Nome</span>
                <span style={{ flex: 1 }}>Preço (R$)</span>
                <span style={{ width: 80 }}>Estoque</span>
                <span style={{ width: 30 }}></span>
              </div>
            )}
            {editVariants.map((v, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                <input value={v.name} onChange={(e) => { const up = [...editVariants]; up[i] = { ...up[i], name: e.target.value }; setEditVariants(up); }} placeholder="Ex: P / Preto" style={{ ...fieldStyle, flex: 2 }} />
                <input type="number" step="0.01" min="0" value={(v.price / 100).toFixed(2)} onChange={(e) => { const up = [...editVariants]; up[i] = { ...up[i], price: Math.round(Number(e.target.value) * 100) }; setEditVariants(up); }} placeholder="0.00" style={{ ...fieldStyle, flex: 1 }} />
                <input type="number" value={v.stock} onChange={(e) => { const up = [...editVariants]; up[i] = { ...up[i], stock: Number(e.target.value) }; setEditVariants(up); }} placeholder="50" style={{ ...fieldStyle, width: 80 }} />
                <button onClick={() => setEditVariants(editVariants.filter((_, j) => j !== i))} style={{ padding: "6px 10px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>×</button>
              </div>
            ))}
            <button onClick={() => setEditVariants([...editVariants, { name: "", price: editPrice, stock: 50 }])} style={{ padding: "6px 14px", background: "#1e2d7d", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, marginTop: 4 }}>
              + Adicionar variante
            </button>
          </div>

          {/* Collections */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Coleções</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {collections.map((col) => (
                <label key={col.id} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: selectedCollections.includes(col.id) ? "#e7f3ff" : "#f5f5f5", border: "1px solid #ddd", borderRadius: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={selectedCollections.includes(col.id)} onChange={(e) => {
                    setSelectedCollections(e.target.checked ? [...selectedCollections, col.id] : selectedCollections.filter((id) => id !== col.id));
                  }} />
                  {col.title}
                </label>
              ))}
            </div>
          </div>

          {/* Specs */}
          {scraped.specs.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Especificações extraídas</label>
              <div style={{ fontSize: 12, background: "#f9f9f9", borderRadius: 4, padding: 10 }}>
                {scraped.specs.slice(0, 12).map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "3px 0", borderBottom: "1px solid #eee" }}>
                    <span style={{ fontWeight: 600, minWidth: 140 }}>{s.key}</span>
                    <span style={{ color: "#555" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source info */}
          <div style={{ fontSize: 11, color: "#888", marginBottom: 16 }}>
            Fonte: {scraped.source === "shopee" ? "Shopee" : "Mercado Livre"} | {scraped.sourceUrl?.slice(0, 60)}...
            {scraped.rating && ` | ${scraped.rating.toFixed(1)} ★`}
            {scraped.sold && ` | ${scraped.sold} vendidos`}
          </div>

          <button onClick={handleImport} disabled={importing} style={{ padding: "14px 32px", background: "#28a745", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: importing ? "default" : "pointer", opacity: importing ? 0.6 : 1 }}>
            {importing ? "Importando..." : `Importar Produto para a Loja`}
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
// REVIEWS MANAGER (import + list)
// ══════════════════════════════════════

interface ReviewData {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  images: string | null;
  source: string | null;
  approved: boolean;
  createdAt: string;
}

interface ScrapedReview {
  rating: number;
  content: string;
  author: string;
  date: string;
  images: string[];
}

function ReviewsManager({ backendUrl, token }: { backendUrl: string; token: string }) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [loading, setLoading] = useState(true);

  // Import state
  const [importUrl, setImportUrl] = useState("");
  const [importStatus, setImportStatus] = useState<{ text: string; type: "info" | "success" | "error" | "warning" } | null>(null);
  const [scrapedReviews, setScrapedReviews] = useState<ScrapedReview[]>([]);
  const [importing, setImporting] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [minStars, setMinStars] = useState(4);
  const [downloadPhotos, setDownloadPhotos] = useState(true);

  // Manual add state
  const [showManual, setShowManual] = useState(false);
  const [manualReview, setManualReview] = useState({ rating: 5, title: "", body: "", author: "", images: "" });

  // Load products and reviews
  useEffect(() => {
    fetch(`${backendUrl}/store/products?limit=100`).then((r) => r.json()).then((d) => {
      const prods = (d.products || []).map((p: { id: string; title: string }) => ({ id: p.id, title: p.title }));
      setProducts(prods);
      if (prods.length > 0 && !selectedProduct) setSelectedProduct(prods[0].id);
    }).catch(() => {});
  }, [backendUrl]);

  useEffect(() => {
    if (!selectedProduct) { setLoading(false); return; }
    setLoading(true);
    fetch(`${backendUrl}/store/products/${selectedProduct}/reviews`)
      .then((r) => r.json())
      .then((d) => { setReviews(d.reviews || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedProduct, backendUrl]);

  // Scrape reviews from URL via backend
  const handleScrape = async () => {
    if (!importUrl.trim()) { setImportStatus({ text: "Cole a URL do produto", type: "error" }); return; }

    setScraping(true);
    setImportStatus({ text: "Extraindo avaliações... isso pode levar alguns segundos", type: "warning" });
    setScrapedReviews([]);

    try {
      const res = await fetch(`${backendUrl}/admin/scrape-reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: importUrl.trim() }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setImportStatus({ text: data.error || "Erro ao extrair", type: "error" });
        setScraping(false);
        return;
      }

      setScrapedReviews(data.reviews || []);
      const photoCount = (data.reviews || []).reduce((s: number, r: ScrapedReview) => s + (r.images?.length || 0), 0);
      setImportStatus({
        text: `${data.reviews.length} avaliações extraídas (${photoCount} fotos). Filtre e importe abaixo.`,
        type: "success",
      });
    } catch (err) {
      setImportStatus({ text: `Erro de conexão: ${(err as Error).message}`, type: "error" });
    } finally {
      setScraping(false);
    }
  };

  // Import scraped reviews
  const handleImport = async () => {
    const filtered = scrapedReviews.filter((r) => r.rating >= minStars);
    if (filtered.length === 0) { setImportStatus({ text: "Nenhuma avaliação para importar com esse filtro", type: "warning" }); return; }
    if (!selectedProduct) { setImportStatus({ text: "Selecione um produto destino", type: "error" }); return; }

    setImporting(true);
    setImportProgress(0);
    setImportStatus({ text: `Importando ${filtered.length} avaliações...`, type: "warning" });

    try {
      const res = await fetch(`${backendUrl}/admin/import-reviews/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          reviews: filtered.map((r) => ({
            rating: r.rating,
            title: r.content?.slice(0, 60) || `Avaliação ${r.rating} estrelas`,
            body: r.content || "Avaliação importada",
            author: r.author,
            images: downloadPhotos ? r.images : [],
            source: importUrl.includes("shopee") ? "shopee" : "mercadolivre",
            originalDate: r.date,
          })),
          productId: selectedProduct,
          downloadImages: downloadPhotos,
        }),
      });

      const result = await res.json();
      setImportProgress(100);
      setImportStatus({
        text: `${result.imported} avaliações importadas! ${result.photosSaved ? `(${result.photosSaved} fotos salvas)` : ""}`,
        type: "success",
      });
      setScrapedReviews([]);

      // Reload reviews
      const revRes = await fetch(`${backendUrl}/store/products/${selectedProduct}/reviews`);
      const revData = await revRes.json();
      setReviews(revData.reviews || []);
    } catch {
      setImportStatus({ text: "Erro ao importar", type: "error" });
    } finally {
      setImporting(false);
    }
  };

  // Add manual review
  const handleManualAdd = async () => {
    if (!manualReview.title || !manualReview.body) { setImportStatus({ text: "Preencha título e texto", type: "error" }); return; }
    try {
      const images = manualReview.images ? manualReview.images.split("\n").map((u) => u.trim()).filter(Boolean) : [];
      await fetch(`${backendUrl}/store/products/${selectedProduct}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...manualReview, images }),
      });
      setImportStatus({ text: "Avaliação adicionada!", type: "success" });
      setManualReview({ rating: 5, title: "", body: "", author: "", images: "" });
      setShowManual(false);
      // Reload
      const revRes = await fetch(`${backendUrl}/store/products/${selectedProduct}/reviews`);
      const revData = await revRes.json();
      setReviews(revData.reviews || []);
    } catch { setImportStatus({ text: "Erro ao adicionar", type: "error" }); }
  };

  // Delete review
  const handleDelete = async (id: string) => {
    try {
      await fetch(`${backendUrl}/admin/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch { /* ignore */ }
  };

  const filteredScraped = scrapedReviews.filter((r) => r.rating >= minStars);

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 20, color: "#1e2d7d" }}>Avaliações</h2>

      {/* Product selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, display: "block" }}>Produto</label>
        <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, minWidth: 300 }}>
          {products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <span style={{ marginLeft: 12, fontSize: 13, color: "#888" }}>{reviews.length} avaliações</span>
      </div>

      {importStatus && (
        <div style={{ padding: "10px 16px", borderRadius: 6, marginBottom: 12, fontSize: 13, background: importStatus.type === "success" ? "#d4edda" : importStatus.type === "error" ? "#f8d7da" : importStatus.type === "warning" ? "#fff3cd" : "#e7f3ff", color: importStatus.type === "success" ? "#155724" : importStatus.type === "error" ? "#721c24" : importStatus.type === "warning" ? "#856404" : "#1e5f9a" }}>
          {importStatus.text}
        </div>
      )}

      {/* Extension banner */}
      <ExtensionBanner type="avaliação" />

      {/* ── Import section ── */}
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Importar da Shopee / Mercado Livre</h3>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
          Cole a URL de um produto da Shopee ou Mercado Livre para importar as avaliações com fotos em massa.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://shopee.com.br/... ou https://www.mercadolivre.com.br/..."
            style={{ flex: 1, padding: "10px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13 }}
          />
          <button
            onClick={handleScrape}
            disabled={scraping}
            style={{ padding: "10px 20px", background: "#1e2d7d", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: scraping ? "default" : "pointer", opacity: scraping ? 0.6 : 1, whiteSpace: "nowrap" }}
          >
            {scraping ? "Extraindo..." : "Extrair"}
          </button>
        </div>

        {/* Scraped reviews preview */}
        {scrapedReviews.length > 0 && (
          <div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600 }}>Estrelas mínimas</label>
                <select value={minStars} onChange={(e) => setMinStars(Number(e.target.value))} style={{ marginLeft: 6, padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, fontSize: 12 }}>
                  <option value={1}>Todas</option>
                  <option value={3}>3+</option>
                  <option value={4}>4+</option>
                  <option value={5}>5 apenas</option>
                </select>
              </div>
              <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <input type="checkbox" checked={downloadPhotos} onChange={(e) => setDownloadPhotos(e.target.checked)} />
                Baixar fotos para o servidor
              </label>
              <span style={{ fontSize: 12, color: "#888" }}>
                {filteredScraped.length} de {scrapedReviews.length} reviews | {filteredScraped.reduce((s, r) => s + (r.images?.length || 0), 0)} fotos
              </span>
            </div>

            {/* Preview list with individual selection */}
            <div style={{ maxHeight: 400, overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 12 }}>
              {filteredScraped.slice(0, 30).map((r, i) => (
                <div key={i} style={{ padding: "12px 14px", borderBottom: "1px solid #f0f0f0", fontSize: 13, display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: "#f59e0b", fontSize: 13 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                        <span style={{ fontWeight: 600, color: "#374151" }}>{r.author || "Anônimo"}</span>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>Verificado ✓</span>
                      </div>
                      <span style={{ color: "#9ca3af", fontSize: 11 }}>{r.date}</span>
                    </div>
                    {r.content && <p style={{ color: "#6b7280", marginTop: 2, lineHeight: 1.4 }}>{r.content.slice(0, 200)}{r.content.length > 200 ? "..." : ""}</p>}
                    {r.images?.length > 0 && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        {r.images.slice(0, 5).map((img, j) => (
                          <img key={j} src={img} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ))}
                        {r.images.length > 5 && <div style={{ width: 52, height: 52, borderRadius: 6, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#6b7280", fontWeight: 600 }}>+{r.images.length - 5}</div>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredScraped.length > 30 && <p style={{ textAlign: "center", padding: 10, fontSize: 12, color: "#9ca3af" }}>... e mais {filteredScraped.length - 30} avaliações</p>}
            </div>

            <button
              onClick={handleImport}
              disabled={importing || filteredScraped.length === 0}
              style={{ padding: "12px 24px", background: "#28a745", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: importing ? 0.6 : 1 }}
            >
              {importing ? `Importando... ${importProgress}%` : `Importar ${filteredScraped.length} avaliações em massa`}
            </button>
          </div>
        )}
      </div>

      {/* ── Manual add ── */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setShowManual(!showManual)} style={{ background: "none", border: "1px solid #1e2d7d", color: "#1e2d7d", padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          {showManual ? "Cancelar" : "+ Adicionar avaliação manual"}
        </button>

        {showManual && (
          <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 20, marginTop: 12 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 3 }}>Estrelas</label>
                <select value={manualReview.rating} onChange={(e) => setManualReview({ ...manualReview, rating: Number(e.target.value) })} style={{ padding: 6, border: "1px solid #ddd", borderRadius: 4 }}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 3 }}>Autor</label>
                <input value={manualReview.author} onChange={(e) => setManualReview({ ...manualReview, author: e.target.value })} placeholder="Nome" style={{ width: "100%", padding: 6, border: "1px solid #ddd", borderRadius: 4, fontSize: 13 }} />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 3 }}>Título</label>
              <input value={manualReview.title} onChange={(e) => setManualReview({ ...manualReview, title: e.target.value })} style={{ width: "100%", padding: 6, border: "1px solid #ddd", borderRadius: 4, fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 3 }}>Texto</label>
              <textarea value={manualReview.body} onChange={(e) => setManualReview({ ...manualReview, body: e.target.value })} rows={3} style={{ width: "100%", padding: 6, border: "1px solid #ddd", borderRadius: 4, fontSize: 13, resize: "vertical" }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 3 }}>URLs de fotos (uma por linha)</label>
              <textarea value={manualReview.images} onChange={(e) => setManualReview({ ...manualReview, images: e.target.value })} rows={2} placeholder={"https://exemplo.com/foto1.jpg\nhttps://exemplo.com/foto2.jpg"} style={{ width: "100%", padding: 6, border: "1px solid #ddd", borderRadius: 4, fontSize: 12, resize: "vertical", fontFamily: "monospace" }} />
            </div>
            <button onClick={handleManualAdd} style={{ padding: "8px 20px", background: "#1e2d7d", color: "#fff", border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
              Adicionar
            </button>
          </div>
        )}
      </div>

      {/* ── Reviews list ── */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          Avaliações do produto ({reviews.length})
        </h3>

        {loading ? (
          <p style={{ color: "#888" }}>Carregando...</p>
        ) : reviews.length === 0 ? (
          <p style={{ color: "#888", fontSize: 14 }}>Nenhuma avaliação para este produto.</p>
        ) : (
          <div>
            {reviews.map((review) => {
              const imgs: string[] = review.images ? JSON.parse(review.images) : [];
              return (
                <div key={review.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: 16, marginBottom: 8, position: "relative" }}>
                  <button onClick={() => handleDelete(review.id)} title="Excluir" style={{ position: "absolute", top: 8, right: 12, background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 18 }}>×</button>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: "#ffbd00", fontSize: 16 }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{review.author}</span>
                    {review.source && <span style={{ fontSize: 10, background: review.source === "shopee" ? "#ee4d2d" : "#fff159", color: review.source === "shopee" ? "#fff" : "#333", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{review.source}</span>}
                    {!review.approved && <span style={{ fontSize: 10, background: "#fff3cd", color: "#856404", padding: "2px 8px", borderRadius: 10 }}>Pendente</span>}
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{review.title}</p>
                  <p style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{review.body}</p>
                  {imgs.length > 0 && (
                    <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                      {imgs.map((img, i) => (
                        <img key={i} src={img.startsWith("/") ? `${backendUrl}${img}` : img} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 4, border: "1px solid #eee" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>
                    {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ExtensionBanner({ type }: { type: string }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: 12, padding: "18px 20px", marginBottom: 20,
      display: "flex", alignItems: "center", gap: 16, color: "#fff",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: "rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, flexShrink: 0,
      }}>
        🧩
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
          Extensão do Chrome — Importador Avançado
        </div>
        <div style={{ fontSize: 12, opacity: 0.85, lineHeight: 1.4 }}>
          Para importar {type}s da <strong>Shopee</strong> com fotos, use nossa extensão do Chrome.
          A Shopee bloqueia scraping direto do servidor. A extensão extrai os dados diretamente do navegador.
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        <a
          href="/review-importer-extension.zip"
          download
          style={{
            padding: "8px 16px", borderRadius: 8,
            background: "#fff", color: "#667eea",
            textDecoration: "none", fontSize: 12, fontWeight: 700,
            textAlign: "center", whiteSpace: "nowrap",
          }}
        >
          Baixar extensão (.zip)
        </a>
        <div style={{ fontSize: 10, opacity: 0.7, textAlign: "center" }}>
          Chrome / Edge / Brave
        </div>
      </div>
    </div>
  );
}
