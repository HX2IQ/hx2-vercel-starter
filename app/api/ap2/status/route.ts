import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const Gateway =
      process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";

    const r = await fetch(`${Gateway}/api/ap2/status`, {
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
      { ok: false, error: "ap2_proxy_failed", detail: String(e?.message || e) },
      { status: 502, headers: { "cache-control": "no-store" } }
    );
  }
}

// Optional: allow OPTIONS without 405 noise
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { "allow": "OPTIONS, POST", "cache-control": "no-store" },
  });
}
