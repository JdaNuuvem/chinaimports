"use client";

import { useState, useRef } from "react";
import { PageHeader } from "./shared";

interface DownloadOption {
  label: string;
  itag: number;
  quality: string;
  type: "video" | "audio";
  ext: string;
  filesize: number;
}

interface VideoData {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: number;
  views: number;
  likes: number;
  downloads: DownloadOption[];
}

type State = "idle" | "loading" | "done" | "error";

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatNumber(n: number): string {
  if (!n) return "0";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

export default function YouTubeDownloaderTab() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>("idle");
  const [video, setVideo] = useState<VideoData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
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
      setErrorMsg("Cole um link do YouTube para começar.");
      return;
    }

    setState("loading");
    setErrorMsg("");
    setVideo(null);

    try {
      const res = await fetch("/api/youtube-download", {
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

      if (!data.downloads?.length) {
        setState("error");
        setErrorMsg("Nenhum formato de download disponível para este vídeo.");
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
    if (!video) return;
    const safeName = `${video.author}_${video.title}`.substring(0, 80).replace(/[^a-zA-Z0-9_\- ]/g, "_");
    const proxyUrl = `/api/youtube-proxy?url=${encodeURIComponent(url.trim())}&itag=${dl.itag}&filename=${encodeURIComponent(safeName)}&type=${dl.type}`;

    // Use <a href> pointing to the server URL (not blob).
    // The server sends Content-Disposition: attachment which triggers a real download.
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

  return (
    <div>
      <PageHeader
        title="Download de Vídeos YouTube"
        subtitle="Baixe vídeos e Shorts do YouTube — processamento via yt-dlp no servidor"
      />

      <div style={{ padding: "0 24px 24px" }}>
        {/* Search Bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, maxWidth: 700 }}>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleFetch(); }}
            placeholder="Cole o link do YouTube aqui..."
            style={{
              flex: 1, padding: "12px 16px", border: "2px solid #e5e7eb",
              borderRadius: 10, fontSize: 14, outline: "none", transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#ff0000")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
          <button
            onClick={handlePaste}
            style={{
              padding: "12px 18px", background: "#f3f4f6", border: "2px solid #e5e7eb",
              borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
              color: "#555", whiteSpace: "nowrap", transition: "background 0.2s",
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
              background: state === "done" ? "#6b7280" : "#ff0000",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              cursor: state === "loading" ? "wait" : "pointer",
              opacity: state === "loading" ? 0.7 : 1,
              whiteSpace: "nowrap", transition: "background 0.2s",
            }}
          >
            {state === "loading" ? "Buscando..." : state === "done" ? "Novo vídeo" : "Buscar"}
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div style={{
            padding: "12px 16px", marginBottom: 16, background: "#fef2f2",
            border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626",
            fontSize: 13, maxWidth: 700,
          }}>
            {errorMsg}
          </div>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "40px 0",
            justifyContent: "center", maxWidth: 700,
          }}>
            <div style={{
              width: 32, height: 32, border: "3px solid #e5e7eb",
              borderTopColor: "#ff0000", borderRadius: "50%",
              animation: "yt-spin 0.8s linear infinite",
            }} />
            <span style={{ color: "#666", fontSize: 14 }}>Buscando informações do vídeo...</span>
            <style>{`@keyframes yt-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Result */}
        {state === "done" && video && (
          <div style={{
            maxWidth: 700, background: "#fff", border: "1px solid #e5e7eb",
            borderRadius: 12, overflow: "hidden",
          }}>
            {/* Video Info */}
            <div style={{ display: "flex", gap: 16, padding: 20 }}>
              {video.thumbnail && (
                <div style={{
                  width: 200, height: 112, borderRadius: 8, overflow: "hidden",
                  flexShrink: 0, background: "#f3f4f6", position: "relative",
                }}>
                  <img
                    src={video.thumbnail}
                    alt="Thumbnail"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {video.duration > 0 && (
                    <span style={{
                      position: "absolute", bottom: 4, right: 4,
                      background: "rgba(0,0,0,0.8)", color: "#fff",
                      padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                    }}>
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 8,
                  lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {video.title || "Vídeo sem título"}
                </p>
                <p style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>
                  {video.author}
                </p>
                <p style={{ fontSize: 11, color: "#bbb" }}>
                  {formatNumber(video.views)} views
                  {video.likes > 0 && ` · ${formatNumber(video.likes)} likes`}
                </p>
              </div>
            </div>

            {/* Download Options */}
            <div style={{
              borderTop: "1px solid #f0f0f0", padding: 20,
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <p style={{
                fontSize: 12, fontWeight: 600, color: "#888",
                textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4,
              }}>
                Opções de download
              </p>

              {video.downloads.map((dl, i) => {
                const isVideo = dl.type === "video";
                const color = isVideo ? "#ff0000" : "#8b5cf6";

                return (
                  <button
                    key={i}
                    onClick={() => handleDownload(dl)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 18px", background: "#fff",
                      border: `2px solid ${color}20`, borderRadius: 10,
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${color}08`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{isVideo ? "🎬" : "🎵"}</span>
                      <div style={{ textAlign: "left" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>
                          {dl.label}
                        </span>
                        <br />
                        <span style={{ fontSize: 11, color: "#999" }}>
                          {dl.quality}
                          {dl.filesize > 0 && ` · ${formatFileSize(dl.filesize)}`}
                        </span>
                      </div>
                    </div>
                    <span style={{
                      padding: "6px 16px", background: color, color: "#fff",
                      borderRadius: 6, fontSize: 12, fontWeight: 700,
                    }}>
                      Baixar
                    </span>
                  </button>
                );
              })}

              <p style={{ fontSize: 11, color: "#ccc", marginTop: 4 }}>
                O download pode levar alguns segundos dependendo do tamanho do vídeo.
              </p>
            </div>
          </div>
        )}

        {/* Tip */}
        {state === "idle" && (
          <div style={{
            marginTop: 12, padding: "14px 18px", background: "#fff5f5",
            border: "1px solid #fecdd3", borderRadius: 8, fontSize: 13,
            color: "#be123c", maxWidth: 700,
          }}>
            <strong>Como usar:</strong> Cole o link de qualquer vídeo ou Short do YouTube.
            Funciona com links completos (youtube.com/watch?v=...) e shorts (youtube.com/shorts/...).
          </div>
        )}
      </div>
    </div>
  );
}
