import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOW_HOST_SUFFIXES = [
  ".wikipedia.org",
  ".gov",
  ".edu",
  ".org",
  ".reuters.com",
  ".apnews.com",
  ".bbc.co.uk",
  ".nytimes.com",
  ".wsj.com",
  ".bloomberg.com",
];

function isAllowedHost(host: string): boolean {
  const h = host.toLowerCase();
  return ALLOW_HOST_SUFFIXES.some(sfx => h === sfx.slice(1) || h.endsWith(sfx));
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!m) return "";
  return stripHtml(m[1]).slice(0, 160);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const urlRaw = String(body?.url || "").trim();
    if (!urlRaw) {
      return NextResponse.json({ ok: false, error: "missing url" }, { status: 400 });
    }

    let url: URL;
    try {
      url = new URL(urlRaw);
    } catch {
      return NextResponse.json({ ok: false, error: "bad url" }, { status: 400 });
    }

    if (!["http:", "https:"].includes(url.protocol)) {
      return NextResponse.json({ ok: false, error: "unsupported protocol" }, { status: 400 });
    }

    if (!isAllowedHost(url.hostname)) {
      return NextResponse.json(
        { ok: false, error: "host not allowed", host: url.hostname },
        { status: 403 }
      );
    }

    const maxBytes = Math.max(50_000, Math.min(800_000, Number(body?.max_bytes ?? 250_000)));

    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 12000);

    const r = await fetch(url.toString(), {
      method: "GET",
      signal: ac.signal,
      headers: {
        "User-Agent": "HX2-WebFetch/0.1 (+https://optinodeiq.com)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5",
      },
      cache: "no-store",
    }).finally(() => clearTimeout(to));

    const status = r.status;
    const ct = (r.headers.get("content-type") || "").toLowerCase();

    const ab = await r.arrayBuffer();
    const sliced = ab.byteLength > maxBytes ? ab.slice(0, maxBytes) : ab;

    const textRaw = new TextDecoder("utf-8").decode(sliced);
    const title = ct.includes("html") ? pickTitle(textRaw) : "";
    const text = ct.includes("html") ? stripHtml(textRaw) : textRaw.trim();

    const excerpt = text.slice(0, 900);

    return NextResponse.json({
      ok: r.ok,
      url: url.toString(),
      fetched_at: new Date().toISOString(),
      status,
      content_type: ct,
      bytes: sliced.byteLength,
      title,
      text,
      excerpt,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}