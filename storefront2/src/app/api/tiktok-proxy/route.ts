import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route to download TikTok media files.
 * TikTok CDN blocks direct browser downloads (CORS / referer checks),
 * so we stream them through our server.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") || "tiktok-video";
  const type = req.nextUrl.searchParams.get("type") || "video"; // video | audio

  if (!url) {
    return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
  }

  // Only allow TikTok-related domains
  try {
    const parsed = new URL(url);
    const allowed = [
      "tiktokv.com",
      "tiktokcdn.com",
      "tiktok.com",
      "musical.ly",
      "muscdn.com",
      "byteoversea.com",
      "ibytedtos.com",
      "byteimg.com",
      "tiktokcdn-us.com",
      "tikwm.com",
    ];
    const hostname = parsed.hostname;
    if (!allowed.some((d) => hostname.endsWith(d))) {
      return NextResponse.json(
        { error: "Domínio não permitido" },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Referer: "https://www.tiktok.com/",
      },
      signal: AbortSignal.timeout(60000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream retornou ${upstream.status}` },
        { status: 502 }
      );
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    const ext = type === "audio" ? "mp3" : "mp4";
    const safeFilename = filename.replace(/[^a-zA-Z0-9_-]/g, "_");

    const data = await upstream.arrayBuffer();

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}.${ext}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Erro ao baixar mídia",
      },
      { status: 502 }
    );
  }
}
