import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "hx2_registry",
    mode: "SAFE",
    nodes: [],
    ts: new Date().toISOString(),
  });
}











