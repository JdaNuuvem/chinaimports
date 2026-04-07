"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginCustomer, AUTH_TOKEN_KEY, AUTH_FLAG_KEY } from "@/lib/medusa-client";
import { mergeWishlistOnLogin } from "@/lib/wishlist";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await loginCustomer(email, password);
      if (result.data?.customer && result.data?.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, result.data.token);
        localStorage.setItem(AUTH_FLAG_KEY, "true");
        // Merge any local wishlist into the customer's persisted wishlist
        await mergeWishlistOnLogin();
        router.push("/account");
      } else {
        setError(result.error || "E-mail ou senha incorretos.");
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
      <h1 className="heading h1" style={{ textAlign: "center", marginBottom: 30 }}>Entrar em minha conta</h1>

      {error && <div className="alert alert--error" style={{ marginBottom: 20 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={fieldStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={fieldStyle} />
        </div>
        <button type="submit" disabled={loading} className="button button--primary" style={{ width: "100%", padding: 15, fontSize: 16, fontWeight: 700 }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/account/register" className="link">Novo cliente? Criar sua conta</Link>
        </div>
      </form>
    </div>
  );
}
