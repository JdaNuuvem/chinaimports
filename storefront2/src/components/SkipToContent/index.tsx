"use client";

export default function SkipToContent() {
  return (
    <a
      href="#main"
      style={{
        position: "absolute",
        top: -100,
        left: 0,
        background: "var(--primary-color, #1e2d7d)",
        color: "#fff",
        padding: "12px 24px",
        zIndex: 10000,
        fontWeight: 700,
        fontSize: 14,
        textDecoration: "none",
        transition: "top 0.2s",
      }}
      onFocus={(e) => { e.currentTarget.style.top = "0"; }}
      onBlur={(e) => { e.currentTarget.style.top = "-100px"; }}
    >
      Pular para o conteúdo principal
    </a>
  );
}
