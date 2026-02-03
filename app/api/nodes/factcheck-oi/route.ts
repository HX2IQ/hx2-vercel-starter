import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    node: "factcheck-oi",
    message: "factcheck-oi from OI",
    ts: new Date().toISOString()
  });
}
