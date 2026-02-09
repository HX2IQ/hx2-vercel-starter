import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const session = req.headers.get("x-hx2-session") || "default";
    const Gateway = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";

    const r = await fetch(`${Gateway}/brain/memory/status`, {
      method: "GET",
      headers: { "x-hx2-session": session }
    });

    const text = await r.text();
    // Pass-through JSON if possible, otherwise wrap
    try {
      const data = JSON.parse(text);
      return NextResponse.json({ ok: r.ok, forwarded: true, url: `${Gateway}/brain/memory/status`, upstream_status: r.status, data }, { status: 200 });
    } catch {
      return NextResponse.json({ ok: r.ok, forwarded: true, url: `${Gateway}/brain/memory/status`, upstream_status: r.status, data: { raw: text } }, { status: 200 });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}