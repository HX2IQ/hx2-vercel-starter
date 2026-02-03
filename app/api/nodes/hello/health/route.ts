import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    node: "hello",
    status: "healthy",
    ts: new Date().toISOString()
  });
}
