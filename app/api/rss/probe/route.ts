import { NextRequest, NextResponse } from "next/server";
import * as dns from "node:dns/promises";

export const runtime = "nodejs";

function safeUrl(u: string) {
  const url = new URL(u);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only http/https allowed");
  return url;
}

export async function POST(req: NextRequest) {
  const started = new Date().toISOString();
  try {
    const body = await req.json().catch(() => ({}));
    const urlStr = String(body?.url || "").trim();
    const timeout_ms = Math.max(1000, Math.min(20000, Number(body?.timeout_ms ?? 9000)));

    if (!urlStr) {
      return NextResponse.json({ ok: false, error: "Missing url", started }, { status: 400 });
    }

    const url = safeUrl(urlStr);

    // DNS probe (helps distinguish "fetch failed" causes)
    let dns_ok = false;
    let dns_addrs: any[] = [];
    try {
      dns_addrs = await dns.lookup(url.hostname, { all: true });
      dns_ok = true;
    } catch (e: any) {
      dns_ok = false;
    }

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeout_ms);

    let status: number | null = null;
    let content_type: string | null = null;
    let final_url: string | null = null;
    let text_head: string | null = null;

    try {
      const r = await fetch(url.toString(), {
        method: "GET",
        redirect: "follow",
        cache: "no-store",
        signal: ac.signal,
        headers: {
          "User-Agent": "hx2-rss-probe/1.0 (+https://optinodeiq.com)",
          "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.1",
        },
      });

      status = r.status;
      content_type = r.headers.get("content-type");
      final_url = r.url;

      const txt = await r.text();
      text_head = txt.slice(0, 500);
    } finally {
      clearTimeout(t);
    }

    return NextResponse.json({
      ok: true,
      started,
      url: url.toString(),
      final_url,
      timeout_ms,
      dns_ok,
      dns_addrs,
      status,
      content_type,
      text_head,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        started,
        error: String(e?.message || e),
        name: e?.name || null,
        cause: e?.cause ? String(e.cause) : null,
      },
      { status: 500 }
    );
  }
}