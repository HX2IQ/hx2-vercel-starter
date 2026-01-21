import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body: any = await req.json().catch(() => ({}));
    const path = (body?.path || "").toString();
    if (!path || !path.startsWith("/")) {
      return NextResponse.json({ ok: false, error: "missing_or_bad_path", hint: 'Expected { "path": "/api/nodes/<id>/describe" }' }, { status: 400 });
    }

    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || "";

    const url = new URL("/api/console/execute", req.url);
    const payload = {
      mode: "SAFE",
      task: { type: "node.http.get", payload: { path } }
    };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await r.text().catch(() => "");
    try {
      const data = JSON.parse(text);
      return NextResponse.json({ ok: true, data }, { status: 200 });
    } catch {
      return NextResponse.json({ ok: false, error: "non_json_console_execute", raw: text.slice(0, 800) }, { status: 502 });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "console.nodes.get failed" }, { status: 500 });
  }
}
