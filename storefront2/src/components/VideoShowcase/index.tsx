interface VideoItem {
  url: string;
  title?: string;
  thumbnail?: string;
}

interface VideoShowcaseProps {
  title?: string;
  videos: VideoItem[];
}

export default function VideoShowcase({ title = "Vídeos", videos }: VideoShowcaseProps) {
  if (videos.length === 0) return null;

  return (
    <div className="section">
      <div className="container">
        {title && (
          <div className="section__header">
            <h2 className="section__title heading h3">{title}</h2>
          </div>
        )}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(300px, 1fr))`,
          gap: 20,
        }}>
          {videos.map((video, i) => (
            <div key={i} style={{ borderRadius: 8, overflow: "hidden", position: "relative", aspectRatio: "16/9", background: "#000" }}>
              <iframe
                src={video.url}
                title={video.title || `Vídeo ${i + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
