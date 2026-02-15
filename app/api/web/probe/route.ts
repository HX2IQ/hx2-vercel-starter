import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const started = new Date().toISOString();
  try {
    const body = await req.json().catch(() => ({}));
    const q = String((body as any)?.q || "Super Bowl winner");
    const n = Number((body as any)?.n || 5);

    const u = new URL("/api/web/search", req.url);

    const sr = await fetch(u, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ q, n }),
    });

    const ct = sr.headers.get("content-type") || null;
    const txt = await sr.text();
    const head = txt.slice(0, 280);

    let parsed: any = null;
    let parse_ok = false;
    let keys: string[] = [];
    let results_n = 0;

    try {
      parsed = JSON.parse(txt);
      parse_ok = true;
      keys = parsed && typeof parsed === "object" ? Object.keys(parsed) : [];
      const results = Array.isArray(parsed?.results) ? parsed.results : [];
      results_n = results.length;
    } catch {}

    return NextResponse.json(
      {
        ok: true,
        started,
        search_url: u.toString(),
        search_status: sr.status,
        search_content_type: ct,
        parse_ok,
        keys,
        results_n,
        text_head: head,
      },
      { headers: { "cache-control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, started, error: e?.message || String(e) },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}