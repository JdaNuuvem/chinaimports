import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: "center", padding: "60px 20px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
      <h1 className="heading h1" style={{ fontSize: 56, marginBottom: 8, color: "var(--heading-color)" }}>404</h1>
      <p className="heading h3" style={{ marginBottom: 12 }}>Página não encontrada</p>
      <p style={{ marginBottom: 32, color: "#6b7280", lineHeight: 1.6 }}>
        A página que você está buscando pode ter sido removida, renomeada ou está temporariamente indisponível.
      </p>

      {/* Search suggestion */}
      <div style={{ marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
        <form action="/search" method="get" style={{ display: "flex", gap: 8 }}>
          <input
            name="q"
            type="text"
            placeholder="Buscar produtos..."
            style={{
              flex: 1, padding: "12px 16px",
              border: "1px solid var(--border-color, #e1e3e5)",
              borderRadius: 8, fontSize: 14,
            }}
          />
          <button
            type="submit"
            className="button button--primary"
            style={{ padding: "12px 20px", whiteSpace: "nowrap" }}
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Popular links */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#374151" }}>Páginas populares:</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "Masculino", href: "/collections/masculino" },
            { label: "Feminino", href: "/collections/feminino" },
            { label: "Calçados", href: "/collections/calcados" },
            { label: "Outlet", href: "/collections/outlet" },
            { label: "Lançamentos", href: "/collections/lancamentos" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: "8px 16px", borderRadius: 20,
                border: "1px solid var(--border-color, #e1e3e5)",
                color: "var(--primary-color, #1e2d7d)",
                textDecoration: "none", fontSize: 13, fontWeight: 500,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <Link href="/" className="button button--primary" style={{ padding: "14px 40px" }}>
        ← Voltar para a página inicial
      </Link>
    </div>
  );
}
