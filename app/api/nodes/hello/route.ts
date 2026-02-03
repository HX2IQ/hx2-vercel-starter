import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    node: "hello",
    message: "hello from OI",
    ts: new Date().toISOString()
  });
}
