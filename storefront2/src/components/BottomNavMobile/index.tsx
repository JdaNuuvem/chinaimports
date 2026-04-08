"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import SearchBar from "@/components/SearchBar";

/**
 * Mobile-only fixed bottom navigation: Home / Search / Cart / Account.
 * Hidden via CSS at >= 769px.
 */
export default function BottomNavMobile() {
  const { itemCount, setCartOpen } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);

  const itemStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    padding: "8px 4px",
    color: "#374151",
    textDecoration: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    position: "relative",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .bottom-nav-mobile { display: none; }
        @media (max-width: 768px) {
          .bottom-nav-mobile { display: flex; }
          body { padding-bottom: 64px; }
        }
      `}} />

      <nav
        className="bottom-nav-mobile"
        role="navigation"
        aria-label="Navegação inferior"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: 60,
          background: "#fff",
          borderTop: "1px solid #e5e7eb",
          boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
          zIndex: 90,
          alignItems: "stretch",
        }}
      >
        <Link href="/" style={itemStyle} aria-label="Início">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Início
        </Link>

        <button type="button" onClick={() => setSearchOpen(true)} style={itemStyle} aria-label="Buscar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Buscar
        </button>

        <button type="button" onClick={() => setCartOpen(true)} style={itemStyle} aria-label="Carrinho">
          <div style={{ position: "relative" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && (
              <span style={{
                position: "absolute",
                top: -6,
                right: -8,
                background: "#dc2626",
                color: "#fff",
                borderRadius: "50%",
                width: 16,
                height: 16,
                fontSize: 10,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>{itemCount}</span>
            )}
          </div>
          Carrinho
        </button>

        <Link href="/account/login" style={itemStyle} aria-label="Conta">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Conta
        </Link>
      </nav>

      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
    </>
  );
}
