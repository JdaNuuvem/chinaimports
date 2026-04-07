"use client";
import { useState, useEffect } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ua_admin_dark") === "true";
    setDark(saved);
    if (saved) {
      document.querySelector(".admin-panel")?.classList.add("dark");
    }
  }, []);

  const toggle = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem("ua_admin_dark", String(newDark));
    const panel = document.querySelector(".admin-panel");
    if (panel) {
      panel.classList.toggle("dark", newDark);
    }
  };

  return (
    <button
      onClick={toggle}
      className="admin-topbar__btn"
      title={dark ? "Modo claro" : "Modo escuro"}
      style={{ fontSize: 15, padding: "6px 10px" }}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
