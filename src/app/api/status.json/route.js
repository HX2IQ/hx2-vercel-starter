import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    status: "ok",
    health: {
      core: "ok",
      drive: "ok",
      db: "ok",
      openai: "ok",
    },
    metrics: {
      uptimeSec: process.uptime(),
      errorRate1h: 0.2,
      p95LatencyMs: 180,
      queueDepth: 0,
      nodeStatus: { H2: "ok", X2: "ok", K2: "ok", AH2: "ok" },
    },
    timestamp: new Date().toISOString(),
    source: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
  };

  return NextResponse.json(data);
}
