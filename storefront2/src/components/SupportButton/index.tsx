"use client";
import { useState } from "react";
import { CloseIcon, WhatsAppIcon } from "@/components/Icons";

interface SupportButtonProps {
  whatsappNumber?: string;
  whatsappMessage?: string;
}

export default function SupportButton({ whatsappNumber = "5511999999999", whatsappMessage = "Olá! Preciso de ajuda com a Imports China Brasil" }: SupportButtonProps) {
  const [open, setOpen] = useState(false);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 900 }}>
        {open && (
          <div style={{ position: "absolute", bottom: "70px", right: 0, width: "300px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", overflow: "hidden" }}>
            <div style={{ background: "#25D366", color: "#fff", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>Precisa de ajuda?</strong>
                <p style={{ fontSize: "12px", margin: "4px 0 0", opacity: 0.9 }}>Fale com um atendente</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "#25D366", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: 600, justifyContent: "center" }}>
                <WhatsAppIcon className="w-5 h-5" />
                Iniciar conversa
              </a>
              <p style={{ fontSize: "11px", color: "#888", textAlign: "center", marginTop: "10px" }}>Seg a Sex, 9h às 18h</p>
            </div>
          </div>
        )}
        <button onClick={() => setOpen(!open)} style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#25D366", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }} aria-label="Suporte">
          {open ? <CloseIcon className="w-6 h-6" /> : <WhatsAppIcon className="w-7 h-7" />}
        </button>
      </div>
    </>
  );
}
