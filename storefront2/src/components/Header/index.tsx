"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { HamburgerIcon, SearchIcon, CartIcon, UserIcon } from "@/components/Icons";
import MobileMenu from "@/components/MobileMenu";
import MiniCart from "@/components/MiniCart";
import SearchBar from "@/components/SearchBar";
import { useCart } from "@/context/CartContext";
import { getThemeConfig } from "@/lib/theme-config";

export default function Header() {
  const config = getThemeConfig();
  const navLinks = config.header.navLinks;
  const identity = config.identity;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, cartOpen, setCartOpen } = useCart();

  // Responsive logo sizing — desktop via inline style, mobile via @media.
  // useId() gives us a stable class name unique per Header instance.
  const uid = useId().replace(/:/g, "-");
  const logoClass = `header-logo-img-${uid}`;
  const desktopLogoH = identity.logoHeight || 40;
  const mobileLogoH = identity.logoHeightMobile || desktopLogoH;

  return (
    <>
      <style>{`
        .${logoClass} { height: ${desktopLogoH}px; }
        @media (max-width: 640px) {
          .${logoClass} { height: ${mobileLogoH}px; }
        }
      `}</style>
      <header className="header header--inline" role="banner">
        <div className="container">
          <div className="header__inner">
            {/* Mobile Nav Toggle */}
            <nav className="header__mobile-nav hidden-lap-and-up">
              <button
                className="header__mobile-nav-toggle icon-state touch-area"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Menu"
              >
                <span className="icon-state__primary">
                  <HamburgerIcon className="w-6 h-6" />
                </span>
              </button>
            </nav>

            {/* Logo */}
            <div className="header__logo">
              <Link href="/" className="header__logo-link">
                {identity.logoUrl ? (
                  <img src={identity.logoUrl} alt={identity.storeName} className={logoClass} style={{ width: "auto" }} />
                ) : (
                  <span className="header__logo-text" style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "2px" }}>
                    {identity.logoText}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="header__desktop-nav hidden-pocket" role="navigation">
              <ul className="header__linklist list--unstyled" role="list">
                {navLinks.map((link) => (
                  <li key={link.href} className="header__linklist-item">
                    <Link href={link.href} className="header__linklist-link link">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Action Icons */}
            <div className="header__action-list">
              <button
                className="header__action-item link"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Pesquisar"
              >
                <SearchIcon className="w-5 h-5" />
              </button>

              <Link href="/account/login" className="header__action-item link hidden-pocket" aria-label="Conta">
                <UserIcon className="w-5 h-5" />
              </Link>

              <button
                className="header__action-item link"
                onClick={() => setCartOpen(!cartOpen)}
                aria-label="Carrinho"
              >
                <CartIcon className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="header__cart-count">{itemCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} links={navLinks} />
      <MiniCart />
    </>
  );
}
