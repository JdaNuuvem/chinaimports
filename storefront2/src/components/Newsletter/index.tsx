"use client";
import { useState } from "react";
import { NewsletterIcon } from "@/components/Icons";
import { getThemeConfig } from "@/lib/theme-config";
import { subscribeNewsletter } from "@/lib/medusa-client";

export default function NewsletterBar() {
  const config = getThemeConfig();
  const nl = config.newsletter;

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!nl.enabled) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError(false);
    try {
      const result = await subscribeNewsletter(email);
      if (result.data?.success) {
        setSubscribed(true);
        setEmail("");
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="barra-newsletter" className="posicao-rodape" style={{ background: nl.backgroundColor }}>
      <div className="conteiner">
        <div className="row-fluid">
          <div className="componente newsletter">
            <div className="newsletter-titulo">
              <NewsletterIcon className="w-8 h-8" />
              <span className="titulo" style={{ color: nl.textColor, marginLeft: "10px" }}>
                {nl.title}
              </span>
            </div>
            <div className="interno-conteudo">
              {subscribed ? (
                <p style={{ color: "#45EC7F" }}>Cadastro realizado com sucesso!</p>
              ) : (
                <>
                  {error && (
                    <p style={{ color: "#ff6b6b", marginBottom: 8, fontSize: 13 }}>
                      Erro ao cadastrar. Tente novamente.
                    </p>
                  )}
                  <form onSubmit={handleSubmit} className="newsletter-cadastro input-conteiner">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Digite seu e-mail"
                      className="form__field form__field--text"
                      required
                      disabled={submitting}
                      style={{ flex: 1, padding: "10px 15px", border: "none", borderRadius: "4px 0 0 4px" }}
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="botao botao-input newsletter-assinar"
                      style={{ background: "#45EC7F", color: "#2C2438", padding: "10px 25px", border: "none", fontWeight: 600, borderRadius: "0 4px 4px 0", cursor: "pointer", opacity: submitting ? 0.7 : 1 }}
                    >
                      {submitting ? "Enviando..." : "Cadastrar"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
