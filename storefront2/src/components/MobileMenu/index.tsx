"use client";
import Link from "next/link";
import { CloseIcon } from "@/components/Icons";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: { title: string; href: string }[];
}

export default function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  return (
    <>
      {open && <div className="modal__overlay" onClick={onClose} />}
      <div className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu__inner">
          <button className="mobile-menu__close" onClick={onClose} aria-label="Fechar">
            <CloseIcon className="w-6 h-6" />
          </button>

          <ul className="mobile-menu__linklist list--unstyled">
            {links.map((link) => (
              <li key={link.href} className="mobile-menu__linklist-item">
                <Link href={link.href} className="mobile-menu__link" onClick={onClose}>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mobile-menu__footer">
            <Link href="/account/login" className="mobile-menu__link" onClick={onClose}>
              Entrar / Criar conta
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mobile-menu {
          position: fixed;
          top: 0;
          left: -320px;
          width: 320px;
          height: 100vh;
          background: var(--background, #fff);
          z-index: 1000;
          transition: left 0.3s ease;
          overflow-y: auto;
          box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }
        .mobile-menu.is-open { left: 0; }
        .mobile-menu__inner { padding: 20px; }
        .mobile-menu__close {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
          padding: 10px 0;
          background: none;
          border: none;
          cursor: pointer;
        }
        .mobile-menu__linklist { margin-top: 20px; }
        .mobile-menu__linklist-item { border-bottom: 1px solid var(--border-color, #e0e0e0); }
        .mobile-menu__link {
          display: block;
          padding: 15px 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--text-color, #1e2d7d);
          text-decoration: none;
        }
        .mobile-menu__footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border-color, #e0e0e0); }
        .modal__overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 999;
        }
      `}</style>
    </>
  );
}
