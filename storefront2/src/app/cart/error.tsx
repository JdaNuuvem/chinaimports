"use client";

export default function Error({ error: _error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container" style={{ padding: "60px 20px", textAlign: "center" }}>
      <h1 className="heading h2">Algo deu errado</h1>
      <p style={{ marginTop: 12, color: "var(--text-color)" }}>Ocorreu um erro inesperado. Tente novamente.</p>
      <button onClick={reset} className="button button--primary" style={{ marginTop: 20, padding: "12px 24px" }}>
        Tentar novamente
      </button>
    </div>
  );
}
