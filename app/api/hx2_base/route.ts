import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "hx2_base",
    mode: "SAFE",
    status: "online",
    ts: new Date().toISOString(),
  });
}
