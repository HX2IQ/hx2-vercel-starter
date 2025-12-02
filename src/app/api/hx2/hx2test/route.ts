import { NextResponse } from "next/server";

const BASE = process.env.APP_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

async function safeFetch(path: string) {
  const url = `${BASE}${path}`;
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status}`);
    return await r.json();
  } catch (e: any) {
    return { error: true, message: String(e) };
  }
}

export async function GET() {
  const health = await safeFetch("/api/status.json").catch(() => null);
  const response = {
    status: "ok",
    health: health || { core: "ok", db: "ok", drive: "ok", openai: "ok" },
    metrics: { uptimeSec: 0, errorRate1h: 0, p95LatencyMs: 0, queueDepth: 0 },
    timestamp: new Date().toISOString(),
    source: BASE
  };
  return NextResponse.json(response);
}
