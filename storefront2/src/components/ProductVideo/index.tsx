"use client";

import { useState } from "react";

interface ProductVideoProps {
  videoUrl: string;
  thumbnail?: string;
  title?: string;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

  // Direct video URL (mp4, webm)
  if (url.match(/\.(mp4|webm|ogg)$/i)) return url;

  return null;
}

export default function ProductVideo({ videoUrl, thumbnail, title = "Vídeo do produto" }: ProductVideoProps) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getEmbedUrl(videoUrl);

  if (!embedUrl) return null;

  // Direct video file
  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg)$/i);

  if (playing) {
    if (isDirectVideo) {
      return (
        <div style={{ position: "relative", width: "100%", borderRadius: 8, overflow: "hidden", background: "#000" }}>
          <video
            src={embedUrl}
            controls
            autoPlay
            style={{ width: "100%", display: "block" }}
          />
        </div>
      );
    }

    return (
      <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", borderRadius: 8, overflow: "hidden" }}>
        <iframe
          src={embedUrl}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      style={{
        position: "relative", width: "100%", display: "block",
        border: "none", padding: 0, cursor: "pointer",
        borderRadius: 8, overflow: "hidden",
        background: "#000",
      }}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title}
          style={{ width: "100%", display: "block", opacity: 0.8 }}
        />
      ) : (
        <div style={{ width: "100%", paddingBottom: "56.25%", background: "#1a1a2e" }} />
      )}

      {/* Play button overlay */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 64, height: 64, borderRadius: "50%",
        background: "rgba(255,255,255,0.9)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        transition: "transform 0.2s",
      }}>
        <div style={{
          width: 0, height: 0,
          borderTop: "12px solid transparent",
          borderBottom: "12px solid transparent",
          borderLeft: "20px solid #1e2d7d",
          marginLeft: 4,
        }} />
      </div>

      <div style={{
        position: "absolute", bottom: 12, left: 12,
        background: "rgba(0,0,0,0.7)", color: "#fff",
        padding: "4px 10px", borderRadius: 4,
        fontSize: 11, fontWeight: 600,
      }}>
        ▶ Ver vídeo do produto
      </div>
    </button>
  );
}
