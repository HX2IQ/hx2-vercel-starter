import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export const runtime = "nodejs";

type RssItem = {
  title: string;
  url: string;
  published_at?: string | null;
  summary?: string | null;
  source?: string | null;
};

function pickText(x: any): string {
  if (x == null) return "";
  if (typeof x === "string") return x;
  if (typeof x === "number") return String(x);
  if (typeof x === "object") {
    // fast-xml-parser may return {"#text": "..."} or {"@_href": "..."}
    if (typeof x["#text"] === "string") return x["#text"];
    if (typeof x["@_href"] === "string") return x["@_href"];
    if (typeof x["@_url"] === "string") return x["@_url"];
  }
  return "";
}

function normalizeUrl(linkNode: any): string {
  // RSS: <link>https://...</link>
  // Atom: <link href="https://..."/>
  // Atom alt: <link>https://...</link>
  if (typeof linkNode === "string") return linkNode;
  if (Array.isArray(linkNode)) {
    // Prefer rel="alternate" if present
    const alt = linkNode.find((l: any) => (l?.["@_rel"] || l?.rel) === "alternate") || linkNode[0];
    const href = alt?.["@_href"] || alt?.href;
    if (typeof href === "string") return href;
    return pickText(alt);
  }
  if (typeof linkNode === "object" && linkNode) {
    const href = linkNode["@_href"] || linkNode.href;
    if (typeof href === "string") return href;
  }
  return pickText(linkNode);
}

function toArray<T>(v: T | T[] | undefined | null): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export async function POST(req: NextRequest) {
  const started = new Date().toISOString();
  try {
    const body = await req.json().catch(() => ({}));
    const url = String(body?.url || "").trim();
    const n = Math.max(1, Math.min(50, Number(body?.n ?? 10)));
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
        // many feeds block empty UA
        "user-agent": "hx2-rss-fetch/1.0 (+https://patch.optinodeiq.com)",
        "accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
    }).finally(() => clearTimeout(t));

    const status = r.status;
    const content_type = r.headers.get("content-type") || "";
    const text = await r.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      // keep text nodes as strings
      parseTagValue: true,
      trimValues: true,
    });

    let doc: any;
    try {
      doc = parser.parse(text);
    } catch (e: any) {
      return NextResponse.json(
        {
          ok: false,
          error: "xml_parse_failed",
          started,
          fetched_at: new Date().toISOString(),
          status,
          content_type,
          text_head: text.slice(0, 400),
        },
        { status: 502 }
      );
    }

    // RSS 2.0
    const rssItems = toArray(doc?.rss?.channel?.item).map((it: any) => {
      const title = pickText(it?.title);
      const url = normalizeUrl(it?.link);
      const published_at = pickText(it?.pubDate) || pickText(it?.published) || pickText(it?.date);
      const summary = pickText(it?.description) || pickText(it?.["content:encoded"]);
      return { title, url, published_at: published_at || null, summary: summary || null, source: "rss" } as RssItem;
    });

    // Atom
    const atomEntries = toArray(doc?.feed?.entry).map((en: any) => {
      const title = pickText(en?.title);
      const url = normalizeUrl(en?.link);
      const published_at = pickText(en?.updated) || pickText(en?.published);
      const summary = pickText(en?.summary) || pickText(en?.content);
      return { title, url, published_at: published_at || null, summary: summary || null, source: "atom" } as RssItem;
    });

    const items = [...rssItems, ...atomEntries]
      .filter((x) => x && x.url)
      .slice(0, n);

    const meta = {
      title:
        pickText(doc?.rss?.channel?.title) ||
        pickText(doc?.feed?.title) ||
        null,
      site:
        pickText(doc?.rss?.channel?.link) ||
        normalizeUrl(doc?.feed?.link) ||
        null,
    };

    return NextResponse.json({
      ok: true,
      started,
      fetched_at: new Date().toISOString(),
      url,
      status,
      content_type,
      n: items.length,
      meta,
      items,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e), started, at: new Date().toISOString() },
      { status: 500 }
    );
  }
}