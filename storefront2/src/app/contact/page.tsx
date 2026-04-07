"use client";
import { useState } from "react";
import { submitContactForm } from "@/lib/medusa-client";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const result = await submitContactForm(form);
      if (result.data?.success) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const fieldStyle = { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: 4, fontSize: 14 };

  return (
    <div className="container" style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
      <h1 className="heading h1" style={{ marginBottom: 10 }}>Contato</h1>
      <p style={{ color: "var(--text-color)", marginBottom: 30 }}>
        Tem alguma dúvida? Envie uma mensagem e responderemos em até 24 horas.
      </p>

      {status === "sent" && (
        <div className="alert alert--success" style={{ marginBottom: 20 }}>
          Mensagem enviada com sucesso! Retornaremos em breve.
        </div>
      )}
      {status === "error" && (
        <div className="alert alert--error" style={{ marginBottom: 20 }}>
          Erro ao enviar mensagem. Tente novamente.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Seu nome</label>
          <input value={form.name} onChange={(e) => update("name", e.target.value)} required style={fieldStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Seu e-mail</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required style={fieldStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Sua mensagem</label>
          <textarea value={form.message} onChange={(e) => update("message", e.target.value)} required rows={5} style={{ ...fieldStyle, resize: "vertical" }} />
        </div>
        <button type="submit" disabled={status === "sending"} className="button button--primary" style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 700 }}>
          {status === "sending" ? "Enviando..." : "Enviar mensagem"}
        </button>
      </form>
    </div>
  );
}
