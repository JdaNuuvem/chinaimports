"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerCustomer, AUTH_TOKEN_KEY, AUTH_FLAG_KEY } from "@/lib/medusa-client";
import { mergeWishlistOnLogin } from "@/lib/wishlist";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await registerCustomer(form);
      if (result.data?.customer && result.data?.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, result.data.token);
        localStorage.setItem(AUTH_FLAG_KEY, "true");
        await mergeWishlistOnLogin();
        router.push("/account");
      } else {
        setError(result.error || "Não foi possível criar a conta. Tente novamente.");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = { width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: 4, fontSize: 14 };

  return (
    <div className="container" style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px" }}>
      <h1 className="heading h1" style={{ textAlign: "center", marginBottom: 30 }}>Criar minha conta</h1>

      {error && <div className="alert alert--error" style={{ marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Primeiro nome</label>
            <input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} required style={fieldStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Sobrenome</label>
            <input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} required style={fieldStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>E-mail</label>
          <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required style={fieldStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Senha</label>
          <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} style={fieldStyle} />
        </div>
        <button type="submit" disabled={loading} className="button button--primary" style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 700 }}>
          {loading ? "Criando conta..." : "Criar minha conta"}
        </button>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/account/login" className="link">Já tem uma conta? Entre aqui</Link>
        </div>
      </form>
    </div>
  );
}
