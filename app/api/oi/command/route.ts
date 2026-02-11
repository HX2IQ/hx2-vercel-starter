import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// SAFE-by-default command router.
// - single-read body parsing
// - forwards x-hx2-session
// - routes known commands to existing endpoints (brain health/status/tail + chat send)
export async function POST(req: NextRequest) {
  const t0 = Date.now();

  const Base = process.env.NEXT_PUBLIC_BASE_URL || "https://optinodeiq.com";
  const session = req.headers.get("x-hx2-session") || "";
  const canary = "oi-command-router-v0.1";

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const mode = (body?.mode || "SAFE").toString().toUpperCase();
  const command = (body?.command || "").toString();

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-chat-route-version": canary,
  };
  if (session) headers["x-hx2-session"] = session;

  // Map commands -> URLs (start small & safe)
  let url = "";
  let method: "GET" | "POST" = "GET";
  let payload: any = null;

  if (command === "brain.health") {
    url = `${Base}/api/brain/health?ts=${Date.now()}`;
    method = "GET";
  } else if (command === "brain.status") {
    url = `${Base}/api/brain/status?ts=${Date.now()}`;
    method = "GET";
  } else if (command === "brain.memory.tail") {
    const n = Number(body?.n ?? 20);
    url = `${Base}/api/brain/memory/tail?n=${isFinite(n) ? n : 20}&ts=${Date.now()}`;
    method = "GET";
  } else if (command === "chat.send") {
    url = `${Base}/api/chat/send?ts=${Date.now()}`;
    method = "POST";
    payload = { message: body?.message ?? body?.text ?? body?.input ?? "" };
  } else {
    return NextResponse.json(
      {
        ok: false,
        error: "Unknown command",
        command,
        allowed: ["brain.health", "brain.status", "brain.memory.tail", "chat.send"],
        meta: { mode, session: session || null, canary, ms: Date.now() - t0 },
      },
      { status: 400, headers }
    );
  }

  // Owner gate (keep strict)
  if (mode !== "SAFE") {
    return NextResponse.json(
      {
        ok: false,
        error: "Mode not allowed here yet (SAFE only)",
        meta: { mode, session: session || null, canary, ms: Date.now() - t0 },
      },
      { status: 403, headers }
    );
  }

  try {
    const r = await fetch(url, {
      method,
      headers: session ? { "x-hx2-session": session } : undefined,
      body: method === "POST" ? JSON.stringify(payload) : undefined,
      cache: "no-store",
    });

    const rawText = await r.text();
    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { ok: false, error: "bad json", raw: rawText?.slice(0, 5000) };
    }

    return NextResponse.json(
      {
        ok: r.ok,
        status: r.status,
        forwarded: { method, url },
        data,
        meta: { mode, session: session || null, canary, ms: Date.now() - t0 },
      },
      { status: 200, headers }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: String(e?.message || e),
        meta: { mode, session: session || null, canary, ms: Date.now() - t0 },
      },
      { status: 500, headers }
    );
  }
}