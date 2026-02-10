import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const Gateway = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";
    const url = `${Gateway}/brain/memory/repair`;

    // forward session header (optional)
    const session = req.headers.get("x-hx2-session") || "";

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        ...(session ? { "x-hx2-session": session } : {}),
      },
      cache: "no-store",
    });

    const text = await r.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    const resp = NextResponse.json(
      { ok: r.ok, upstream_status: r.status, upstream_url: url, data },
      { status: r.ok ? 200 : 502 }
    );

    const canary = r.headers.get("x-chat-route-version");
    if (canary) resp.headers.set("x-chat-route-version", canary);
    resp.headers.set("cache-control", "no-store, max-age=0");

    return resp;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}