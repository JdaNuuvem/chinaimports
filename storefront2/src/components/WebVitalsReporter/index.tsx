"use client";
import { useReportWebVitals } from "next/web-vitals";

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

interface Metric {
  id: string;
  name: string;
  value: number;
  rating?: "good" | "needs-improvement" | "poor";
  delta?: number;
  navigationType?: string;
}

export default function WebVitalsReporter() {
  useReportWebVitals((metric: Metric) => {
    const payload = {
      name: metric.name,
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      rating: metric.rating,
      id: metric.id,
      url: typeof window !== "undefined" ? window.location.pathname : undefined,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
    };

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          `${BACKEND}/store/web-vitals`,
          new Blob([JSON.stringify(payload)], { type: "application/json" }),
        );
      } else {
        fetch(`${BACKEND}/store/web-vitals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* swallow */
    }
  });

  return null;
}
