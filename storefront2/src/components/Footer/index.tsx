"use client";
import { useState } from "react";
import Link from "next/link";
import { getThemeConfig } from "@/lib/theme-config";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default function Footer() {
  const config = getThemeConfig();
  const { blocks, socialLinks, copyrightText, showNewsletter } = config.footer;

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer__wrapper">
          <div className="footer__block-list">
            {blocks.map((block) => (
              <div key={block.title} className="footer__block-item footer__block-item--links">
                <p className="footer__title heading h6">{block.title}</p>
                <ul className="footer__linklist list--unstyled">
                  {block.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="footer__link-item link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {showNewsletter && (
              <div className="footer__block-item footer__block-item--newsletter">
                <p className="footer__title heading h6">Newsletter</p>
                <div className="footer__newsletter-wrapper">
                  <p className="footer__newsletter-text">
                    Receba novidades e promoções exclusivas
                  </p>
                  {subscribed ? (
                    <p className="alert alert--success">Você se inscreveu na nossa newsletter!</p>
                  ) : (
                    <form onSubmit={handleNewsletter} className="footer__newsletter-form">
                      <div className="form__input-wrapper">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Seu e-mail"
                          className="form__field form__field--text"
                          required
                        />
                      </div>
                      <button type="submit" className="form__submit button button--primary">
                        Enviar
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Social links */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="footer__social" style={{ display: "flex", gap: 16, justifyContent: "center", padding: "15px 0" }}>
              {Object.entries(socialLinks).map(([platform, url]) =>
                url ? (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="footer__link-item" aria-label={platform}>
                    <i className={`fab fa-${platform}`} style={{ fontSize: 18 }} />
                  </a>
                ) : null
              )}
            </div>
          )}

          <aside className="footer__aside">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div className="footer__aside-item footer__aside-item--copyright">
                <p>{copyrightText}</p>
              </div>
              <LocaleSwitcher />
            </div>
          </aside>
        </div>
      </div>
    </footer>
  );
}
