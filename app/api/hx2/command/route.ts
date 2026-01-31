import { NextRequest, NextResponse } from "next/server";

// HX2 command gateway (SAFE, infra-only).
// IMPORTANT: No brain logic here. This route only dispatches SAFE shell commands.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Json = Record<string, any>;

function ok(data: Json, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

function bad(error: string, status = 400, extra: Json = {}) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body: Json = await req.json().catch(() => ({}));
    const command = String(body.command ?? "");

    if (!command) return bad("missing_command", 400);

    if (command === "hx2.status") {
      return ok({
        service: "hx2_base",
        mode: body.mode ?? "SAFE",
        status: "online",
        ts: new Date().toISOString()
      });
    }

    // KEY FIX: do NOT require registry lookup for node.ping
    if (command === "node.ping") {
      return ok({
        mode: body.mode ?? "SAFE",
        node: body.node ?? null,
        reply: "pong",
        ts: new Date().toISOString()
      });
    }

    return bad("command_not_supported", 400, { command });

  } catch (e: any) {
    return bad("hx2_command_failed", 500, { message: e?.message ?? String(e) });
  }
}
