"use client";

import { useState, useRef, useCallback } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  token?: string;
  label?: string;
  placeholder?: string;
  accept?: string;
  maxSizeMB?: number;
  previewSize?: number;
}

export default function ImageUpload({
  value,
  onChange,
  token,
  label,
  placeholder = "Escolher imagem ou colar URL",
  accept = "image/jpeg,image/png,image/webp,image/svg+xml,image/gif",
  maxSizeMB = 20,
  previewSize = 80,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setError(null);

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/theme-config/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro no upload");
        return;
      }

      onChange(data.url);
    } catch {
      setError("Erro de conexão ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  }, [token, onChange, maxSizeMB]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          uploadFile(file);
          return;
        }
      }
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4, color: "#555" }}>
          {label}
        </label>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {/* Preview */}
        {value && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={value}
              alt="Preview"
              style={{
                width: previewSize,
                height: previewSize,
                objectFit: "cover",
                borderRadius: 6,
                border: "1px solid #ddd",
              }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <button
              onClick={() => onChange("")}
              title="Remover imagem"
              style={{
                position: "absolute", top: -6, right: -6,
                width: 20, height: 20, borderRadius: "50%",
                background: "#e22120", color: "#fff",
                border: "none", cursor: "pointer",
                fontSize: 12, lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        )}

        <div style={{ flex: 1 }}>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onPaste={handlePaste}
            tabIndex={0}
            style={{
              border: `2px dashed ${dragOver ? "var(--accent-color, #00badb)" : "#ddd"}`,
              borderRadius: 6,
              padding: "14px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: dragOver ? "rgba(0,186,219,0.05)" : "#fafafa",
              transition: "all 0.15s",
              fontSize: 13,
              color: "#888",
            }}
          >
            {uploading ? (
              <span style={{ color: "var(--accent-color)" }}>Enviando...</span>
            ) : (
              <>
                <span style={{ fontSize: 20, display: "block", marginBottom: 4 }}>📁</span>
                <span>Clique, arraste ou cole uma imagem aqui</span>
                <span style={{ display: "block", fontSize: 11, color: "#bbb", marginTop: 2 }}>
                  JPG, PNG, WebP, SVG, GIF — máx {maxSizeMB}MB
                </span>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {/* URL manual fallback */}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              onPaste={handlePaste}
              style={{
                flex: 1, padding: "6px 10px",
                border: "1px solid #ddd", borderRadius: 4,
                fontSize: 12, color: "#555",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "#e22120", fontSize: 11, marginTop: 4 }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
