import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

/**
 * Streams a YouTube video/audio download via ytdl-core.
 * Pure Node.js — no yt-dlp binary needed.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const itag = req.nextUrl.searchParams.get("itag");
  const filename = req.nextUrl.searchParams.get("filename") || "youtube-video";
  const type = req.nextUrl.searchParams.get("type") || "video";

  if (!url || !itag) {
    return NextResponse.json(
      { error: "url e itag são obrigatórios" },
      { status: 400 }
    );
  }

  let videoId: string;
  try {
    videoId = ytdl.getVideoID(url);
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const ext = type === "audio" ? "mp3" : "mp4";
  const safeFilename = filename.replace(/[^a-zA-Z0-9_\-. ]/g, "_");
  const contentType = type === "audio" ? "audio/mpeg" : "video/mp4";

  try {
    const info = await ytdl.getInfo(videoId);
    const format = info.formats.find((f) => f.itag === parseInt(itag, 10));

    if (!format) {
      return NextResponse.json(
        { error: "Formato não encontrado" },
        { status: 404 }
      );
    }

    // Stream the video/audio
    const stream = ytdl.downloadFromInfo(info, { format });

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    const data = Buffer.concat(chunks);

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}.${ext}"`,
        "Content-Length": String(data.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Erro no download: ${msg.substring(0, 300)}` },
      { status: 502 }
    );
  }
}
