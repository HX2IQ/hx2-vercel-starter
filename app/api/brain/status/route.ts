import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const expected = process.env.HX2_API_KEY || "";
  return Boolean(expected) && token === expected;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401, headers: { "cache-control": "no-store" } });
    }

    const body = await req.json().catch(() => ({}));
    const Gateway = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";

    // If your VPS brain status needs a log-key, you can forward it:
    // const logKey = process.env.AP2_LOG_KEY || "";
    // headers: { "content-type": "application/json", "x-ap2-log-key": logKey }

    const r = await fetch(`${Gateway}/api/brain/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body || {}),
    });

    const text = await r.text();
    return new NextResponse(text, {
      status: r.status,
      headers: { "content-type": r.headers.get("content-type") || "application/json", "cache-control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "brain_status_proxy_failed", detail: String(e?.message || e) },
      { status: 502, headers: { "cache-control": "no-store" } }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { "allow": "OPTIONS, POST", "cache-control": "no-store" },
  });
}
