import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      ok: true,
      node: "factcheck-oi",
      mode: "SAFE",
      received: body ?? {},
      ts: new Date().toISOString()
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, node: "factcheck-oi", error: e?.message || "unknown_error" },
      { status: 500 }
    );
  }
}
