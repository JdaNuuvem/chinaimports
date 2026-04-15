import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

interface DownloadOption {
  label: string;
  itag: number;
  quality: string;
  type: "video" | "audio";
  ext: string;
  filesize: number;
  hasAudio: boolean;
  hasVideo: boolean;
}

interface YouTubeVideoData {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: number;
  views: number;
  downloads: DownloadOption[];
}

function extractVideoId(url: string): string | null {
  try {
    return ytdl.getVideoID(url);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = (body.url as string)?.trim();

    if (!rawUrl) {
      return NextResponse.json(
        { error: "URL do YouTube é obrigatória" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(rawUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "URL inválida. Cole um link do YouTube." },
        { status: 400 }
      );
    }

    const info = await ytdl.getInfo(videoId);
    const details = info.videoDetails;

    // Build download options
    const downloads: DownloadOption[] = [];
    const seenQualities = new Set<string>();

    // Combined formats (video + audio already merged)
    const combined = info.formats
      .filter((f) => f.hasVideo && f.hasAudio && f.container === "mp4")
      .sort((a, b) => (b.height || 0) - (a.height || 0));

    for (const f of combined) {
      const h = f.height || 0;
      if (h < 240) continue;
      const key = `${h}p`;
      if (seenQualities.has(key)) continue;
      seenQualities.add(key);

      downloads.push({
        label: `MP4 ${h}p`,
        itag: f.itag,
        quality: key,
        type: "video",
        ext: "mp4",
        filesize: parseInt(f.contentLength || "0", 10),
        hasAudio: true,
        hasVideo: true,
      });
    }

    // If no combined found, add video-only with note
    if (downloads.length === 0) {
      const videoOnly = info.formats
        .filter((f) => f.hasVideo && !f.hasAudio && (f.container === "mp4" || f.container === "webm"))
        .sort((a, b) => (b.height || 0) - (a.height || 0));

      const addedHeights = new Set<number>();
      for (const f of videoOnly) {
        const h = f.height || 0;
        if (h < 240 || addedHeights.has(h)) continue;
        addedHeights.add(h);

        downloads.push({
          label: `MP4 ${h}p (sem áudio)`,
          itag: f.itag,
          quality: `${h}p`,
          type: "video",
          ext: "mp4",
          filesize: parseInt(f.contentLength || "0", 10),
          hasAudio: false,
          hasVideo: true,
        });
        if (downloads.length >= 3) break;
      }
    }

    // Audio-only
    const audioFormats = info.formats
      .filter((f) => f.hasAudio && !f.hasVideo)
      .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));

    if (audioFormats.length > 0) {
      const best = audioFormats[0];
      downloads.push({
        label: "MP3 (Áudio)",
        itag: best.itag,
        quality: `${best.audioBitrate || 128}kbps`,
        type: "audio",
        ext: "mp3",
        filesize: parseInt(best.contentLength || "0", 10),
        hasAudio: true,
        hasVideo: false,
      });
    }

    const thumbnail =
      details.thumbnails?.[details.thumbnails.length - 1]?.url ||
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const videoData: YouTubeVideoData = {
      id: videoId,
      title: details.title || "",
      author: details.author?.name || details.ownerChannelName || "",
      thumbnail,
      duration: parseInt(details.lengthSeconds || "0", 10),
      views: parseInt(details.viewCount || "0", 10),
      downloads,
    };

    return NextResponse.json(videoData);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    if (msg.includes("private") || msg.includes("unavailable")) {
      return NextResponse.json(
        { error: "Este vídeo não está disponível ou é privado." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Erro ao processar o vídeo: ${msg.substring(0, 200)}` },
      { status: 500 }
    );
  }
}
