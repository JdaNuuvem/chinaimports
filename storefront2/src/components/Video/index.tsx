"use client";
import { useState } from "react";

interface VideoProps {
  title?: string;
  videoUrl?: string;
  thumbnail?: string;
}

export default function Video({
  title = "Assista",
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
  thumbnail = "https://placehold.co/1200x675/333/fff?text=▶+Assistir+Vídeo",
}: VideoProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="section" data-section-type="video" style={{ textAlign: "center" }}>
      <div className="container">
        {title && <h2 className="heading h3" style={{ marginBottom: "25px" }}>{title}</h2>}
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "12px", background: "#000" }}>
          {!playing ? (
            <div onClick={() => setPlaying(true)} style={{ cursor: "pointer", position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
              <img src={thumbnail} alt={title || "Video"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", bottom: 8, right: 8, fontSize: 10, color: "rgba(255,255,255,0.6)", fontStyle: "italic", pointerEvents: "none" }}>
                Thumbnail recomendado: 1280 x 720px
              </div>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "80px", height: "80px", background: "rgba(255,255,255,0.9)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 0, height: 0, borderTop: "18px solid transparent", borderBottom: "18px solid transparent", borderLeft: "30px solid var(--accent-color, #1e2d7d)", marginLeft: "6px" }} />
              </div>
            </div>
          ) : (
            <iframe src={`${videoUrl}?autoplay=1`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen />
          )}
        </div>
      </div>
    </section>
  );
}
