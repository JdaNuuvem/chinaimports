"use client";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
  image?: string;
}

export default function ShareButtons({ url, title, image }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buttonStyle = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 36, height: 36, borderRadius: "50%",
    border: "1px solid var(--border-color)", background: "none",
    cursor: "pointer", color: "var(--text-color)", transition: "all 0.2s",
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>Compartilhar:</span>

      <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" style={buttonStyle} title="WhatsApp">
        <i className="fab fa-whatsapp" style={{ fontSize: 16 }} />
      </a>

      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" style={buttonStyle} title="Facebook">
        <i className="fab fa-facebook-f" style={{ fontSize: 14 }} />
      </a>

      <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" style={buttonStyle} title="Twitter">
        <i className="fab fa-twitter" style={{ fontSize: 14 }} />
      </a>

      <a href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}${image ? `&media=${encodeURIComponent(image)}` : ""}`} target="_blank" rel="noopener noreferrer" style={buttonStyle} title="Pinterest">
        <i className="fab fa-pinterest-p" style={{ fontSize: 14 }} />
      </a>

      <button onClick={handleCopy} style={buttonStyle} title="Copiar link">
        {copied ? <span style={{ fontSize: 12 }}>✓</span> : <i className="fas fa-link" style={{ fontSize: 12 }} />}
      </button>
    </div>
  );
}
