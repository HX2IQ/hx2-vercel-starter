import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const runtime = "nodejs";

function keysOf(x: any): string[] {
  if (!x || typeof x !== "object") return [];
  return Object.keys(x);
}

export async function POST(req: NextRequest) {
  const started = new Date().toISOString();
  try {
    const body = await req.json().catch(() => ({}));
    const url = String(body?.url || "").trim();
    const timeout_ms = Math.max(1000, Math.min(15000, Number(body?.timeout_ms ?? 9000)));

    if (!url) {
      return NextResponse.json({ ok: false, error: "missing url", started }, { status: 400 });
    }

    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout_ms);

    const r = await fetch(url, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "user-agent": "hx2-rss-probe/1.0 (+https://patch.optinodeiq.com)",
        "accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
    }).finally(() => clearTimeout(t));

    const status = r.status;
    const content_type = r.headers.get("content-type") || "";
    const text = await r.text();

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", trimValues: true });
    let doc: any = null;
    let parse_ok = true;

    try {
      doc = parser.parse(text);
    } catch {
      parse_ok = false;
    }

    return NextResponse.json({
      ok: true,
      started,
      fetched_at: new Date().toISOString(),
      url,
      status,
      content_type,
      parse_ok,
      top_keys: keysOf(doc),
      rss_keys: keysOf(doc?.rss),
      channel_keys: keysOf(doc?.rss?.channel),
      feed_keys: keysOf(doc?.feed),
      text_head: text.slice(0, 400),
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e), started, at: new Date().toISOString() },
      { status: 500 }
    );
  }
}