"use client";
import { useState } from "react";

export default function EmailPreview({ storeName }: { storeName: string }) {
  const [template, setTemplate] = useState<"order" | "abandoned" | "welcome">("order");

  const templates = {
    order: {
      subject: `Pedido confirmado — ${storeName}`,
      body: `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
          <div style="background:#1e2d7d;color:#fff;padding:20px;text-align:center">
            <h1 style="margin:0;font-size:20px">${storeName}</h1>
          </div>
          <div style="padding:30px 20px">
            <h2 style="color:#1e2d7d">Pedido confirmado! 🎉</h2>
            <p>Olá <strong>João</strong>,</p>
            <p>Seu pedido <strong>#1001</strong> foi confirmado e está sendo preparado.</p>
            <div style="background:#f6f6f7;border-radius:8px;padding:15px;margin:20px 0">
              <p style="margin:0 0 8px;font-weight:bold">Resumo do pedido:</p>
              <p style="margin:4px 0">Camiseta UA Tech 2.0 × 1 — R$ 199,00</p>
              <p style="margin:4px 0;font-weight:bold;font-size:16px">Total: R$ 199,00</p>
            </div>
            <p>Você receberá o código de rastreio assim que o pedido for enviado.</p>
            <p style="margin-top:20px;font-size:13px;color:#666">Obrigado por comprar na ${storeName}!</p>
          </div>
          <div style="background:#f6f6f7;padding:15px;text-align:center;font-size:12px;color:#888">
            ${storeName} · Todos os direitos reservados
          </div>
        </div>
      `,
    },
    abandoned: {
      subject: `Esqueceu algo no carrinho? — ${storeName}`,
      body: `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
          <div style="background:#1e2d7d;color:#fff;padding:20px;text-align:center">
            <h1 style="margin:0;font-size:20px">${storeName}</h1>
          </div>
          <div style="padding:30px 20px">
            <h2 style="color:#1e2d7d">Seu carrinho está esperando! 🛒</h2>
            <p>Olá, notamos que você deixou alguns itens no carrinho:</p>
            <div style="background:#f6f6f7;border-radius:8px;padding:15px;margin:20px 0">
              <p style="margin:4px 0">Camiseta UA Tech 2.0 — R$ 199,00</p>
            </div>
            <a href="#" style="display:inline-block;background:#00badb;color:#fff;padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:bold">Finalizar compra</a>
            <p style="margin-top:20px;font-size:13px;color:#666">Esta oferta é válida por 24 horas.</p>
          </div>
          <div style="background:#f6f6f7;padding:15px;text-align:center;font-size:12px;color:#888">
            ${storeName}
          </div>
        </div>
      `,
    },
    welcome: {
      subject: `Bem-vindo à ${storeName}! 🎉`,
      body: `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
          <div style="background:#1e2d7d;color:#fff;padding:20px;text-align:center">
            <h1 style="margin:0;font-size:20px">${storeName}</h1>
          </div>
          <div style="padding:30px 20px;text-align:center">
            <h2 style="color:#1e2d7d">Bem-vindo! 🎉</h2>
            <p>Obrigado por se cadastrar na nossa newsletter.</p>
            <p>Você receberá novidades, promoções exclusivas e lançamentos em primeira mão.</p>
            <a href="#" style="display:inline-block;background:#00badb;color:#fff;padding:12px 30px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:20px">Ver produtos</a>
          </div>
          <div style="background:#f6f6f7;padding:15px;text-align:center;font-size:12px;color:#888">
            ${storeName}
          </div>
        </div>
      `,
    },
  };

  const current = templates[template];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["order", "abandoned", "welcome"] as const).map((t) => (
          <button key={t} onClick={() => setTemplate(t)} style={{ padding: "6px 14px", borderRadius: 6, border: template === t ? "2px solid #008060" : "1px solid #c9cccf", background: template === t ? "#f0fdf4" : "#fff", fontWeight: template === t ? 700 : 400, fontSize: 12, cursor: "pointer", color: template === t ? "#008060" : "#202223" }}>
            {t === "order" ? "📦 Pedido confirmado" : t === "abandoned" ? "🛒 Carrinho abandonado" : "👋 Boas-vindas"}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #e1e3e5", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "8px 12px", background: "#f6f6f7", borderBottom: "1px solid #e1e3e5", fontSize: 12 }}>
          <strong>Assunto:</strong> {current.subject}
        </div>
        <div style={{ padding: 16, background: "#fff" }} dangerouslySetInnerHTML={{ __html: current.body }} />
      </div>

      <p style={{ fontSize: 11, color: "#8c9196", marginTop: 8 }}>
        Configure o SMTP em Configurações para ativar o envio de e-mails.
      </p>
    </div>
  );
}
