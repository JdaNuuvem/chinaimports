import { NextRequest, NextResponse } from "next/server";

interface DownloadOption {
  label: string;
  url: string;
  quality: string;
  type: "video" | "audio";
  watermark: boolean;
}

interface TikTokVideoData {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  thumbnail: string;
  duration: number;
  stats: { plays: number; likes: number; comments: number; shares: number };
  downloads: DownloadOption[];
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = (body.url as string)?.trim();

    if (!rawUrl) {
      return NextResponse.json(
        { error: "URL do TikTok é obrigatória" },
        { status: 400 }
      );
    }

    if (!/tiktok\.com/i.test(rawUrl)) {
      return NextResponse.json(
        { error: "URL inválida. Cole um link do TikTok." },
        { status: 400 }
      );
    }

    // Use tikwm API — same approach as tiktokio.com and similar services
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(rawUrl)}&hd=1`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!apiRes.ok) {
      return NextResponse.json(
        { error: "Serviço temporariamente indisponível. Tente novamente." },
        { status: 502 }
      );
    }

    const json = await apiRes.json();

    if (json.code !== 0 || !json.data) {
      return NextResponse.json(
        {
          error:
            json.msg ||
            "Não foi possível processar o vídeo. Verifique se a URL está correta e se o vídeo é público.",
        },
        { status: 400 }
      );
    }

    const d = json.data;
    const downloads: DownloadOption[] = [];

    // HD video (no watermark)
    if (d.hdplay) {
      downloads.push({
        label: "MP4 sem marca d'água (HD)",
        url: d.hdplay,
        quality: "1080p",
        type: "video",
        watermark: false,
      });
    }

    // Standard video (no watermark)
    if (d.play) {
      downloads.push({
        label: d.hdplay
          ? "MP4 sem marca d'água (SD)"
          : "MP4 sem marca d'água",
        url: d.play,
        quality: d.hdplay ? "720p" : "HD",
        type: "video",
        watermark: false,
      });
    }

    // Watermark video
    if (d.wmplay) {
      downloads.push({
        label: "MP4 com marca d'água",
        url: d.wmplay,
        quality: "HD",
        type: "video",
        watermark: true,
      });
    }

    // Audio
    if (d.music) {
      downloads.push({
        label: `MP3 — ${d.music_info?.title || "Áudio"}`,
        url: d.music,
        quality: "128kbps",
        type: "audio",
        watermark: false,
      });
    }

    const videoData: TikTokVideoData = {
      id: d.id || "",
      title: d.title || "",
      author: d.author?.unique_id || d.author?.nickname || "",
      authorAvatar: d.author?.avatar || "",
      thumbnail: d.origin_cover || d.cover || d.ai_dynamic_cover || "",
      duration: d.duration || 0,
      stats: {
        plays: d.play_count || 0,
        likes: d.digg_count || 0,
        comments: d.comment_count || 0,
        shares: d.share_count || 0,
      },
      downloads,
    };

    // Add formatted stats to title for display
    if (videoData.stats.plays > 0) {
      videoData.title +=
        `\n${formatNumber(videoData.stats.plays)} views · ${formatNumber(videoData.stats.likes)} likes`;
    }

    return NextResponse.json(videoData);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Erro ao processar o vídeo. Tente novamente.",
      },
      { status: 500 }
    );
  }
}
