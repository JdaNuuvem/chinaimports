import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9500";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward to backend
    const res = await fetch(`${BACKEND_URL}/webhooks/luna`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Webhook processing failed", details: (err as Error).message },
      { status: 500 }
    );
  }
}
