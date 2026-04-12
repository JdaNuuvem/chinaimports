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
    <section
      id="barra-newsletter"
      style={{
        background: nl.backgroundColor,
        padding: "24px 0",
      }}
    >
      <style>{`
        .nl-form-wrap {
          display: flex !important;
          overflow: visible !important;
          gap: 0;
          max-width: 480px;
          width: 100%;
        }
        .nl-form-wrap input {
          flex: 1;
          min-width: 0;
        }
        .nl-form-wrap button {
          flex-shrink: 0;
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .nl-section-inner {
            flex-direction: column !important;
            text-align: center;
            gap: 12px !important;
          }
          .nl-form-wrap {
            max-width: 100%;
          }
        }
      `}</style>
      <div className="container">
        <div
          className="nl-section-inner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <NewsletterIcon className="w-8 h-8" />
            <span style={{ color: nl.textColor, fontSize: 16, fontWeight: 700 }}>
              {nl.title}
            </span>
          </div>

          <div style={{ flex: 1, minWidth: 240, maxWidth: 480 }}>
            {subscribed ? (
              <p style={{ color: "#45EC7F", margin: 0, fontWeight: 600 }}>
                Cadastro realizado com sucesso!
              </p>
            ) : (
              <>
                {error && (
                  <p style={{ color: "#ff6b6b", marginBottom: 8, fontSize: 13 }}>
                    Erro ao cadastrar. Tente novamente.
                  </p>
                )}
                <form onSubmit={handleSubmit} className="nl-form-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu e-mail"
                    required
                    disabled={submitting}
                    style={{
                      padding: "12px 16px",
                      border: "none",
                      borderRadius: "6px 0 0 6px",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: "#45EC7F",
                      color: "#2C2438",
                      padding: "12px 24px",
                      border: "none",
                      fontWeight: 700,
                      fontSize: 14,
                      borderRadius: "0 6px 6px 0",
                      cursor: submitting ? "wait" : "pointer",
                      opacity: submitting ? 0.7 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {submitting ? "Enviando..." : "Cadastrar"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
