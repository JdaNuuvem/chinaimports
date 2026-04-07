import { NextResponse } from "next/server";
import { getClientStatus } from "@/lib/medusa-client";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export async function GET() {
  let medusaReachable = false;
  let medusaLatency = -1;

  const start = Date.now();
  try {
    const res = await fetch(`${MEDUSA_URL}/store/products?limit=1`, {
      signal: AbortSignal.timeout(5000),
      headers: { "Content-Type": "application/json" },
    });
    medusaLatency = Date.now() - start;
    medusaReachable = res.ok;
  } catch {
    medusaLatency = Date.now() - start;
  }

  const clientStatus = getClientStatus();
  const overallStatus = medusaReachable
    ? "healthy"
    : clientStatus.circuitBreaker.state === "OPEN"
      ? "down"
      : "degraded";

  return NextResponse.json({
    status: overallStatus,
    medusa: {
      reachable: medusaReachable,
      latency_ms: medusaLatency,
      url: MEDUSA_URL,
    },
    cache: clientStatus.cache,
    circuitBreaker: clientStatus.circuitBreaker,
    timestamp: new Date().toISOString(),
  });
}
