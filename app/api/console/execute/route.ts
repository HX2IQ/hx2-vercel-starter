import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const payload: any = await req.json().catch(() => ({}));
    if (!payload.mode) payload.mode = "SAFE";

    const auth =
      req.headers.get("authorization") ||
      req.headers.get("Authorization") ||
      "";

    // Use a relative URL so we never hit the wrong host.
    const url = new URL("/api/ap2/execute", req.url);

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(payload),
    });

    const text = await r.text().catch(() => "");
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: r.status });
    } catch {
      // If anything returns HTML again, surface it clearly.
      return NextResponse.json(
        { ok: false, error: "non_json_response_from_ap2_execute", status: r.status, raw: text.slice(0, 800) },
        { status: 502 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "console.execute failed" },
      { status: 500 }
    );
  }
}
