import { NextRequest, NextResponse } from "next/server";

/**
 * Receives a binary blob via POST and returns it as an attachment download.
 * This solves the browser issue where blob URLs + <a download> don't preserve
 * the filename/extension in some browsers.
 */
export async function POST(req: NextRequest) {
  const filename = req.nextUrl.searchParams.get("filename") || "download";
  const contentType = req.nextUrl.searchParams.get("type") || "application/octet-stream";

  const data = await req.arrayBuffer();

  if (data.byteLength === 0) {
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }

  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(data.byteLength),
    },
  });
}
