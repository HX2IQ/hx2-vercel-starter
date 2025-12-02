import { NextResponse } from "next/server";

export async function GET() {
  // Simulated example – replace with a real error log fetcher later
  const recentErrors = Array.from({ length: 5 }).map((_, i) => ({
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
    route: "/api/example",
    code: 500,
    messageHash: "err_" + i.toString(36),
  }));

  return NextResponse.json(recentErrors);
}
