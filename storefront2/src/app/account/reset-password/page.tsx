"use client";

import { useState, type FormEvent } from "react";

export default function ResetPasswordPage() {
  const [step, setStep] = useState<"request" | "sent">("request");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
      const res = await fetch(`${backendUrl}/store/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao enviar email");
        return;
      }
      setStep("sent");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  if (step === "sent") {
    return (
      <div className="container" style={{ padding: "80px 20px", maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dbeafe", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 16 }}>
          ✉️
        </div>
        <h1 className="heading h3">E-mail enviado!</h1>
        <p style={{ marginTop: 12, color: "var(--text-color)", lineHeight: 1.6 }}>
          Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá instruções para redefinir sua senha.
        </p>
        <a href="/account/login" style={{ display: "inline-block", marginTop: 24, color: "var(--primary-color, #1e2d7d)", textDecoration: "none", fontWeight: 600 }}>
          ← Voltar para o login
        </a>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "60px 20px", maxWidth: 440, margin: "0 auto" }}>
      <h1 className="heading h3" style={{ textAlign: "center", marginBottom: 8 }}>Recuperar Senha</h1>
      <p style={{ textAlign: "center", color: "var(--text-color)", marginBottom: 32 }}>
        Informe seu e-mail cadastrado para receber o link de recuperação.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          style={{ width: "100%", padding: "12px 14px", border: "1px solid var(--border-color, #e1e3e5)", borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: "border-box" }}
        />
        {error && <p style={{ color: "#e53e3e", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="button button--primary"
          style={{ width: "100%", padding: "14px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Enviando..." : "Enviar link de recuperação"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 24, fontSize: 14 }}>
        <a href="/account/login" style={{ color: "var(--primary-color, #1e2d7d)", textDecoration: "none" }}>
          ← Voltar para o login
        </a>
      </p>
    </div>
  );
}
