import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date().toISOString();
  return NextResponse.json({
    controller: { status: "ok", message: "HX2 controller alive" },
    registry: { nodeCount: 7, onlineCount: 6, offlineCount: 0 },
    ap2: { status: "shadow", mode: "shadow" },
    errors: [],
    timestamp: now,
  });
}
