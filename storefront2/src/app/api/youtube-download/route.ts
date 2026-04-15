import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

interface DownloadOption {
  label: string;
  formatId: string;
  quality: string;
  type: "video" | "audio";
  ext: string;
  filesize: number;
}

interface YouTubeVideoData {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: number;
  views: number;
  likes: number;
  downloads: DownloadOption[];
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be|youtube-nocookie\.com)/i.test(url);
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

    if (!isYouTubeUrl(rawUrl)) {
      return NextResponse.json(
        { error: "URL inválida. Cole um link do YouTube." },
        { status: 400 }
      );
    }

    // Use yt-dlp to get video info
    const { stdout } = await execFileAsync("yt-dlp", [
      "--dump-json",
      "--no-download",
      "--no-warnings",
      rawUrl,
    ], { timeout: 30000, maxBuffer: 10 * 1024 * 1024 });

    const info = JSON.parse(stdout);

    // Build download options
    const downloads: DownloadOption[] = [];
    const formats = (info.formats || []) as Record<string, unknown>[];

    // Collect available video heights
    const videoFormats = formats.filter(
      (f) => f.vcodec !== "none" && typeof f.height === "number" && (f.height as number) >= 240
    );
    const availableHeights = [...new Set(videoFormats.map((f) => f.height as number))].sort((a, b) => b - a);

    // Offer up to 4 video quality tiers using yt-dlp format selection (auto-merges video+audio)
    const targetHeights = [1080, 720, 480, 360];
    for (const target of targetHeights) {
      const closest = availableHeights.find((h) => h <= target);
      if (!closest) continue;
      if (downloads.some((d) => d.quality === `${closest}p`)) continue;

      // Estimate filesize from matching format
      const match = videoFormats.find((f) => f.height === closest);
      const vSize = (match?.filesize as number) || (match?.filesize_approx as number) || 0;

      downloads.push({
        label: `MP4 ${closest}p`,
        formatId: `bestvideo[height<=${closest}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${closest}]+bestaudio/best[height<=${closest}]`,
        quality: `${closest}p`,
        type: "video",
        ext: "mp4",
        filesize: vSize,
      });
    }

    // Fallback: if no heights found, offer "best"
    if (downloads.length === 0) {
      downloads.push({
        label: "MP4 (melhor qualidade)",
        formatId: "best",
        quality: "auto",
        type: "video",
        ext: "mp4",
        filesize: 0,
      });
    }

    // Audio-only option
    downloads.push({
      label: "MP3 (Áudio)",
      formatId: "bestaudio",
      quality: "128kbps",
      type: "audio",
      ext: "mp3",
      filesize: 0,
    });

    const videoData: YouTubeVideoData = {
      id: info.id || "",
      title: info.title || "",
      author: info.uploader || info.channel || "",
      thumbnail: info.thumbnail || "",
      duration: info.duration || 0,
      views: info.view_count || 0,
      likes: info.like_count || 0,
      downloads,
    };

    return NextResponse.json(videoData);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    if (msg.includes("is not available")) {
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
