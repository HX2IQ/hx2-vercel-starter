import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const node = (body?.node ?? body?.payload?.node ?? null);

    // SAFE / infra-only ping: return pong even for shells.
    // This is intentionally minimal and does not touch brain logic.
    return NextResponse.json({
      ok: true,
      command: "node.ping",
      mode: body?.mode ?? "SAFE",
      node,
      reply: "pong",
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "ping_failed" }, { status: 500 });
  }
}
