import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = `Bearer ${process.env.HX2_MONITOR_KEY}`;

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    status: "online",
    version: process.env.HX2_VERSION || "unknown",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    node: process.version,
  });
}
