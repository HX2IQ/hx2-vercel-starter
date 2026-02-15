import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function safeUrl(u: string) {
  const url = new URL(u);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only http/https allowed");
  return url;
}

function decodeHtml(s: string) {
  return s
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function pickTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m ? decodeHtml(m[1].trim()) : null;
}

function pickAttr(block: string, tag: string, attr: string): string | null {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]+)"[^>]*>`, "i");
  const m = block.match(re);
  return m ? m[1] : null;
}

function stripTags(s: string) {
  return decodeHtml(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export async function POST(req: NextRequest) {
  const started = new Date().toISOString();
  try {
    const body = await req.json().catch(() => ({}));
    const urlStr = String(body?.url || "").trim();
    const n = Math.max(1, Math.min(50, Number(body?.n ?? 10)));
    const timeout_ms = Math.max(1000, Math.min(20000, Number(body?.timeout_ms ?? 9000)));

    if (!urlStr) return NextResponse.json({ ok: false, error: "Missing url", started }, { status: 400 });

    const url = safeUrl(urlStr);

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeout_ms);

    let status: number | null = null;
    let content_type: string | null = null;
    let final_url: string | null = null;

    let xml = "";
    try {
      const r = await fetch(url.toString(), {
        method: "GET",
        redirect: "follow",
        cache: "no-store",
        signal: ac.signal,
        headers: {
          "User-Agent": "hx2-rss-fetch/1.0 (+https://optinodeiq.com)",
          "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.1",
        },
      });

      status = r.status;
      content_type = r.headers.get("content-type");
      final_url = r.url;

      xml = await r.text();
    } finally {
      clearTimeout(t);
    }

    if (!xml || (status && status >= 400)) {
      return NextResponse.json(
        { ok: false, started, url: url.toString(), final_url, status, content_type, error: "Non-OK response or empty body" },
        { status: 502 }
      );
    }

    const items: any[] = [];

    // RSS items
    const rssItems = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
    for (const it of rssItems) {
      const title = pickTag(it, "title") || "";
      const link = pickTag(it, "link") || pickAttr(it, "link", "href") || "";
      const pubDate = pickTag(it, "pubDate") || pickTag(it, "date") || null;
      const desc = pickTag(it, "description") || pickTag(it, "content:encoded") || "";
      items.push({
        title: stripTags(title),
        url: link.trim(),
        published_at: pubDate,
        excerpt: stripTags(desc).slice(0, 400),
      });
      if (items.length >= n) break;
    }

    // Atom entries fallback
    if (items.length === 0) {
      const entries = xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
      for (const en of entries) {
        const title = pickTag(en, "title") || "";
        const link = pickAttr(en, "link", "href") || pickTag(en, "link") || "";
        const updated = pickTag(en, "updated") || pickTag(en, "published") || null;
        const summary = pickTag(en, "summary") || pickTag(en, "content") || "";
        items.push({
          title: stripTags(title),
          url: link.trim(),
          published_at: updated,
          excerpt: stripTags(summary).slice(0, 400),
        });
        if (items.length >= n) break;
      }
    }

    // Normalize + filter empties
    const clean = items
      .map((x) => ({
        title: String(x.title || "").trim(),
        url: String(x.url || "").trim(),
        published_at: x.published_at ? String(x.published_at) : null,
        excerpt: String(x.excerpt || "").trim(),
      }))
      .filter((x) => x.title || x.url)
      .slice(0, n);

    return NextResponse.json({
      ok: true,
      started,
      url: url.toString(),
      final_url,
      status,
      content_type,
      n: clean.length,
      items: clean,
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