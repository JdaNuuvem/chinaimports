"use client";

import { useState, useRef } from "react";
import { PageHeader } from "./shared";

interface DownloadOption {
  label: string;
  url: string;
  quality: string;
  type: "video" | "audio";
  watermark: boolean;
}

interface VideoData {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  thumbnail: string;
  duration: number;
  stats: { plays: number; likes: number; comments: number; shares: number };
  downloads: DownloadOption[];
}

type State = "idle" | "loading" | "done" | "error";

export default function TikTokDownloaderTab() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>("idle");
  const [video, setVideo] = useState<VideoData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [downloading] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleFetch = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMsg("Cole um link do TikTok para começar.");
      return;
    }

    setState("loading");
    setErrorMsg("");
    setVideo(null);

    try {
      const res = await fetch("/api/tiktok-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setErrorMsg(data.error || "Erro ao processar o vídeo.");
        return;
      }

      if (data.downloads?.length === 0) {
        setState("error");
        setErrorMsg(
          "Não foi possível extrair os links de download. O vídeo pode ser privado ou a URL inválida."
        );
        return;
      }

      setVideo(data);
      setState("done");
    } catch (err) {
      setState("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Erro de conexão. Tente novamente."
      );
    }
  };

  const handleDownload = (dl: DownloadOption) => {
    const filename = video
      ? `${video.author}_${video.id}`
      : "tiktok-video";
    const proxyUrl = `/api/tiktok-proxy?url=${encodeURIComponent(dl.url)}&filename=${encodeURIComponent(filename)}&type=${dl.type}`;

    const a = document.createElement("a");
    a.href = proxyUrl;
    a.setAttribute("download", "");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setUrl("");
    setVideo(null);
    setState("idle");
    setErrorMsg("");
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <PageHeader
        title="Download de Vídeos TikTok"
        subtitle="Baixe vídeos do TikTok sem marca d'água — processamento no servidor"
      />

      <div style={{ padding: "0 24px 24px" }}>
        {/* Search Bar */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 20,
            maxWidth: 700,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFetch();
            }}
            placeholder="Cole o link do TikTok aqui..."
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: 10,
              fontSize: 14,
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#00badb")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
          <button
            onClick={handlePaste}
            style={{
              padding: "12px 18px",
              background: "#f3f4f6",
              border: "2px solid #e5e7eb",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              color: "#555",
              whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f3f4f6")}
          >
            Colar
          </button>
          <button
            onClick={state === "done" ? reset : handleFetch}
            disabled={state === "loading"}
            style={{
              padding: "12px 28px",
              background: state === "done" ? "#6b7280" : "#00badb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: state === "loading" ? "wait" : "pointer",
              opacity: state === "loading" ? 0.7 : 1,
              whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}
          >
            {state === "loading"
              ? "Buscando..."
              : state === "done"
                ? "Novo vídeo"
                : "Buscar"}
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: 16,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              color: "#dc2626",
              fontSize: 13,
              maxWidth: 700,
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "40px 0",
              justifyContent: "center",
              maxWidth: 700,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid #e5e7eb",
                borderTopColor: "#00badb",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ color: "#666", fontSize: 14 }}>
              Buscando informações do vídeo...
            </span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Result */}
        {state === "done" && video && (
          <div
            style={{
              maxWidth: 700,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Video Info */}
            <div style={{ display: "flex", gap: 16, padding: 20 }}>
              {video.thumbnail && (
                <div
                  style={{
                    width: 140,
                    height: 180,
                    borderRadius: 8,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#f3f4f6",
                  }}
                >
                  <img
                    src={video.thumbnail}
                    alt="Thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#333",
                    marginBottom: 8,
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {video.title?.split("\n")[0] || "Vídeo sem título"}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  {video.authorAvatar && (
                    <img
                      src={video.authorAvatar}
                      alt=""
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <span style={{ fontSize: 13, color: "#888" }}>
                    @{video.author}
                  </span>
                </div>
                {video.duration > 0 && (
                  <p style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>
                    Duração: {formatDuration(video.duration)}
                  </p>
                )}
                {video.stats && video.stats.plays > 0 && (
                  <p style={{ fontSize: 11, color: "#bbb" }}>
                    {video.title?.split("\n")[1]}
                  </p>
                )}
              </div>
            </div>

            {/* Download Options */}
            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 4,
                }}
              >
                Opções de download
              </p>

              {video.downloads.map((dl, i) => {
                const isDownloading = downloading === dl.url;
                const isVideo = dl.type === "video";
                const color = dl.watermark
                  ? "#6b7280"
                  : isVideo
                    ? "#16a34a"
                    : "#8b5cf6";

                return (
                  <button
                    key={i}
                    onClick={() => handleDownload(dl)}
                    disabled={isDownloading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 18px",
                      background: isDownloading ? "#f9fafb" : "#fff",
                      border: `2px solid ${color}20`,
                      borderRadius: 10,
                      cursor: isDownloading ? "wait" : "pointer",
                      transition: "all 0.2s",
                      opacity: isDownloading ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isDownloading)
                        e.currentTarget.style.background = `${color}08`;
                    }}
                    onMouseLeave={(e) => {
                      if (!isDownloading)
                        e.currentTarget.style.background = "#fff";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>
                        {isVideo ? "🎬" : "🎵"}
                      </span>
                      <div style={{ textAlign: "left" }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#333",
                          }}
                        >
                          {dl.label}
                        </span>
                        <br />
                        <span style={{ fontSize: 11, color: "#999" }}>
                          {dl.quality}
                        </span>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "6px 16px",
                        background: color,
                        color: "#fff",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {isDownloading ? "Baixando..." : "Baixar"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tip */}
        {state === "idle" && (
          <div
            style={{
              marginTop: 12,
              padding: "14px 18px",
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: 8,
              fontSize: 13,
              color: "#0369a1",
              maxWidth: 700,
            }}
          >
            <strong>Como usar:</strong> Abra o TikTok, toque em &quot;Compartilhar&quot;
            no vídeo desejado, copie o link e cole aqui. Funciona com links
            curtos (vm.tiktok.com) e completos.
          </div>
        )}
      </div>
    </div>
  );
}
