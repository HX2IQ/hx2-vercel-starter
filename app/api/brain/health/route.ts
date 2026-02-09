import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const Gateway =
      process.env.AP2_GATEWAY_URL ||
      "https://ap2-worker.optinodeiq.com";

    const url = `${Gateway}/brain/memory/health`;

    const r = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      // prevent caching
      cache: "no-store",
    });

    const text = await r.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    const resp = NextResponse.json(
      {
        ok: r.ok,
        upstream_status: r.status,
        upstream_url: url,
        data,
      },
      { status: r.ok ? 200 : 502 }
    );

    // bubble up canary if present
    const canary = r.headers.get("x-chat-route-version");
    if (canary) resp.headers.set("x-chat-route-version", canary);

    // explicit no-cache headers
    resp.headers.set("cache-control", "no-store, max-age=0");

    return resp;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}