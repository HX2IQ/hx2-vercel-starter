import { NextResponse } from "next/server";

export async function GET() {
  const data = {
    uptimeSec: process.uptime(),
    errorRate1h: 0.2,
    p95LatencyMs: 180,
    queueDepth: 0,
    nodeStatus: {
      H2: "ok",
      X2: "ok",
      K2: "ok",
      AH2: "ok",
    },
  };

  return NextResponse.json(data);
}
