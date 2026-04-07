"use client";

import Link from "next/link";
import { useEffect } from "react";
import { captureError } from "@/lib/error-tracking";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { extra: { digest: error.digest, scope: "app/error" } });
  }, [error]);

  return (
    <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
      <h1 className="heading h2">Algo deu errado</h1>
      <p style={{ marginTop: 16, color: "var(--text-color)", maxWidth: 500, margin: "16px auto 0" }}>
        Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
      </p>
      {error?.digest && (
        <p style={{ marginTop: 8, fontSize: 12, color: "#8c9196" }}>
          Código: {error.digest}
        </p>
      )}
      <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={reset}
          className="button button--primary"
          style={{ padding: "12px 24px", cursor: "pointer" }}
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="button button--secondary"
          style={{ padding: "12px 24px", textDecoration: "none" }}
        >
          Página inicial
        </Link>
      </div>
    </div>
  );
}
