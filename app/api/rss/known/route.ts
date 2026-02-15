import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type FeedDef = {
  id: string;
  name: string;
  url: string;
  tier: 1 | 2;
  tags: string[];
};

const FEEDS: FeedDef[] = [
  { id: "bbc_top",        name: "BBC News - Top",           url: "https://feeds.bbci.co.uk/news/rss.xml",              tier: 1, tags: ["mainstream_anchor","world","breaking"] },
  { id: "consortium",     name: "Consortium News",          url: "https://consortiumnews.com/feed/",                   tier: 1, tags: ["investigative","documents","foreign_policy"] },
  { id: "grayzone",       name: "The Grayzone",             url: "https://thegrayzone.com/feed/",                      tier: 1, tags: ["investigative","control_systems","documents"] },
  { id: "mintpress",      name: "MintPress News",           url: "https://www.mintpressnews.com/feed/",                tier: 1, tags: ["foreign_policy","early_signal","investigative"] },
  { id: "zerohedge",      name: "ZeroHedge",                url: "https://feeds.feedburner.com/zerohedge/feed",        tier: 2, tags: ["markets","system_stress","filter_required"] },
];

function byId(ids: string[] | undefined | null): FeedDef[] {
  if (!ids || !Array.isArray(ids) || ids.length === 0) return FEEDS;
  const want = new Set(ids.map(String));
  return FEEDS.filter(f => want.has(f.id));
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    feeds: FEEDS,
  }, { headers: { "cache-control": "no-store" }});
}

export async function POST(req: NextRequest) {
  const started = new Date().toISOString();

  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }

  const ids = body?.ids as string[] | undefined;
  const n = Math.max(1, Math.min(25, Number(body?.n ?? 5)));
  const timeout_ms = Math.max(1000, Math.min(30000, Number(body?.timeout_ms ?? 12000)));

  const picks = byId(ids);

  // Call internal /api/rss/fetch so we don't duplicate parsing logic.
  const fetchUrl = new URL("/api/rss/fetch", req.url).toString();

  const results = await Promise.all(picks.map(async (f) => {
    try {
      const r = await fetch(fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ url: f.url, n, timeout_ms }),
      });

      const json = await r.json().catch(() => ({}));
      const items = Array.isArray(json?.items) ? json.items : [];
      return {
        id: f.id,
        name: f.name,
        url: f.url,
        tier: f.tier,
        tags: f.tags,
        ok: Boolean(json?.ok),
        status: r.status,
        items_n: items.length,
        items,
      };
    } catch (e: any) {
      return {
        id: f.id,
        name: f.name,
        url: f.url,
        tier: f.tier,
        tags: f.tags,
        ok: false,
        status: 0,
        error: e?.message || "fetch failed",
        items_n: 0,
        items: [],
      };
    }
  }));

  return NextResponse.json({
    ok: true,
    started,
    fetched_at: new Date().toISOString(),
    n,
    timeout_ms,
    feeds_n: results.length,
    feeds: results,
  }, { headers: { "cache-control": "no-store" }});
}