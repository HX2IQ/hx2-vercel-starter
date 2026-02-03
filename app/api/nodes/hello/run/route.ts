import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // SAFE: this is just an echo runner to prove the pattern
    return NextResponse.json({
      ok: true,
      node: "hello",
      mode: "SAFE",
      received: body ?? {},
      ts: new Date().toISOString()
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, node: "hello", error: e?.message || "unknown_error" },
      { status: 500 }
    );
  }
}
