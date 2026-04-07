"use client";
import { useEffect, useState } from "react";

interface ShortcutConfig {
  onSave?: () => void;
  onNavigate: (tab: string) => void;
}

export default function KeyboardShortcuts({ onSave, onNavigate }: ShortcutConfig) {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        setShowHelp((v) => !v);
      }
      // Quick navigation: g then key
      if (e.key === "g") {
        const next = (ev: KeyboardEvent) => {
          if (ev.key === "d") onNavigate("dashboard");
          else if (ev.key === "p") onNavigate("products-list");
          else if (ev.key === "o") onNavigate("orders-list");
          else if (ev.key === "c") onNavigate("collections-list");
          else if (ev.key === "s") onNavigate("settings");
          else if (ev.key === "v") onNavigate("visual-editor");
          window.removeEventListener("keydown", next);
        };
        window.addEventListener("keydown", next, { once: true });
        setTimeout(() => window.removeEventListener("keydown", next), 1000);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave, onNavigate]);

  if (!showHelp) return null;

  const shortcuts = [
    { keys: "⌘ K", desc: "Buscar" },
    { keys: "⌘ S", desc: "Salvar" },
    { keys: "?", desc: "Atalhos" },
    { keys: "g → d", desc: "Dashboard" },
    { keys: "g → p", desc: "Produtos" },
    { keys: "g → o", desc: "Pedidos" },
    { keys: "g → c", desc: "Coleções" },
    { keys: "g → s", desc: "Config" },
    { keys: "g → v", desc: "Editor Visual" },
    { keys: "ESC", desc: "Fechar" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowHelp(false)}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", background: "#fff", borderRadius: 12, padding: 24, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#202223" }}>⌨️ Atalhos de teclado</h3>
        <div>
          {shortcuts.map((s) => (
            <div key={s.keys} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f1f1" }}>
              <span style={{ fontSize: 13, color: "#202223" }}>{s.desc}</span>
              <kbd style={{ fontSize: 11, background: "#f6f6f7", padding: "2px 8px", borderRadius: 4, border: "1px solid #e1e3e5", fontFamily: "monospace" }}>{s.keys}</kbd>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "#8c9196", marginTop: 12, textAlign: "center" }}>Pressione <kbd style={{ fontSize: 10, background: "#f6f6f7", padding: "1px 4px", borderRadius: 3, border: "1px solid #e1e3e5" }}>?</kbd> para fechar</p>
      </div>
    </div>
  );
}
