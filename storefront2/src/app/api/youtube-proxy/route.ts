import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

/**
 * Streams a YouTube video/audio download through yt-dlp.
 * The file is piped directly to the response (no temp file on disk).
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const formatId = req.nextUrl.searchParams.get("format") || "best";
  const filename = req.nextUrl.searchParams.get("filename") || "youtube-video";
  const type = req.nextUrl.searchParams.get("type") || "video";

  if (!url) {
    return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
  }

  if (!/(?:youtube\.com|youtu\.be)/i.test(url)) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const ext = type === "audio" ? "mp3" : "mp4";
  const safeFilename = filename.replace(/[^a-zA-Z0-9_\-. ]/g, "_");

  const args = [
    "-f", formatId,
    "--no-warnings",
    "--no-playlist",
    "-o", "-", // Output to stdout
  ];

  // For audio, extract and convert to mp3
  if (type === "audio") {
    args.push("-x", "--audio-format", "mp3");
  } else {
    // For video, merge to mp4
    args.push("--merge-output-format", "mp4");
  }

  args.push(url);

  try {
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      const proc = spawn("yt-dlp", args, {
        timeout: 120000,
        stdio: ["ignore", "pipe", "pipe"],
      });

      proc.stdout.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      let stderr = "";
      proc.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      proc.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(stderr || `yt-dlp exited with code ${code}`));
        }
      });

      proc.on("error", reject);
    });

    const data = Buffer.concat(chunks);

    if (data.length === 0) {
      return NextResponse.json(
        { error: "Download resultou em arquivo vazio" },
        { status: 502 }
      );
    }

    const contentType = type === "audio" ? "audio/mpeg" : "video/mp4";

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
