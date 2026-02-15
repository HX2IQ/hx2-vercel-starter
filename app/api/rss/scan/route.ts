import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type RssItem = {
  title?: string;
  url?: string;
  link?: string;
  published_at?: string;
  pubDate?: string;
  date?: string;
  excerpt?: string;
  summary?: string;
  description?: string;
  contentSnippet?: string;
};

function norm(s: any): string {
  return String(s ?? "").trim();
}

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 3)
    .slice(0, 24);
}

function scoreText(hay: string, terms: string[]): number {
  if (!hay || terms.length === 0) return 0;
  const h = hay.toLowerCase();
  let score = 0;
  for (const t of terms) {
    // simple truthy count; gives more weight if term appears multiple times
    let idx = 0;
    while (true) {
      idx = h.indexOf(t, idx);
      if (idx === -1) break;
      score += 1;
      idx += t.length;
      if (score > 50) break;
    }
    if (score > 50) break;
  }
  return score;
}
function sanitizeQuery(input: string): string {
  // Remove common prompt tails that break RSS/OpenSearch matching
  let s = (input || "").trim();

  // Strip "Cite sources." / "cite sources" / trailing punctuation noise
  s = s.replace(/\b(cite\s+sources\.?|cite\s+source\.?)\b/ig, "").trim();

  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();

  // Remove trailing punctuation that often makes exact-match feeds return 0
  s = s.replace(/[.?!]+$/g, "").trim();

  return s;
}
function parseDate(s: string | null | undefined): number | null {
  const v = (s || "").trim();
  if (!v) return null;

  // Native parse handles RFC822 + ISO8601
  const t = Date.parse(v);
  if (!Number.isNaN(t)) return t;

  // Numeric fallback (seconds or ms)
  const n = Number(v);
  if (Number.isFinite(n)) {
    if (n > 0 && n < 10000000000) return n * 1000;
    if (n >= 10000000000) return n;
  }

  return null;
}



export async function POST(req: NextRequest) {
  const version = "hx2-rss-scan-v1";
  const started = new Date().toISOString();

  try {
    const body = await req.json().catch(() => ({} as any));

    const q0 = norm(body?.q);
    const q = sanitizeQuery(q0);
    if (!q) {
      return NextResponse.json(
        { ok: false, error: "missing q", started, version },
        { status: 400, headers: { "x-rss-scan-version": version, "cache-control": "no-store" } }
      );
    }

    const ids: string[] | null =
      Array.isArray(body?.ids) ? body.ids.map((x: any) => norm(x)).filter(Boolean) : null;

    const n_items_per_feed =
      Number.isFinite(Number(body?.n_items_per_feed)) ? Math.max(1, Math.min(50, Number(body.n_items_per_feed))) : 20;

    const timeout_ms =
      Number.isFinite(Number(body?.timeout_ms)) ? Math.max(1000, Math.min(30000, Number(body.timeout_ms))) : 12000;

    const max_matches =
      Number.isFinite(Number(body?.max_matches)) ? Math.max(1, Math.min(200, Number(body.max_matches))) : 50;

    const rank_mode = norm(body?.rank_mode || "relevance"); // relevance|recent
// Pull normalized items from allowlisted feeds via existing route
    const knownUrl = new URL("/api/rss/known", req.url);

    const res = await fetch(knownUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ ids: ids && ids.length ? ids : undefined, n: n_items_per_feed, timeout_ms })
    });

    const txt = await res.text();
    let data: any = null;
    try { data = JSON.parse(txt); } catch { data = null; }

    if (!res.ok || !data?.ok || !Array.isArray(data?.feeds)) {
      return NextResponse.json(
        {
          ok: false,
          error: "rss/known failed",
          started,
          version,
          upstream: {
            status: res.status,
            ok: Boolean(data?.ok),
            text_head: txt ? txt.slice(0, 240) : null
          }
        },
        { status: 502, headers: { "x-rss-scan-version": version, "cache-control": "no-store" } }
      );
    }

    const terms = tokenize(q);
    const matches: any[] = [];

    let scanned = 0;
    for (const f of data.feeds) {
      const feed_id = norm(f?.id);
      const feed_name = norm(f?.name);
      const items: RssItem[] = Array.isArray(f?.items) ? f.items : [];
      for (const it of items) {
        scanned += 1;
        const title = norm(it?.title);
        const url = norm((it as any)?.url || it?.link);
        const excerpt = norm((it as any)?.excerpt || it?.contentSnippet || it?.summary || it?.description);
        const published_at = norm((it as any)?.published_at || it?.pubDate || (it as any)?.date);
        const published_ms = parseDate(published_at);


        const hay = (title + " " + excerpt).trim();
        const s = scoreText(hay, terms);

        if (s > 0) {
          matches.push({
            feed_id,
            feed_name,
            title,
            url,
            published_at: published_at || null,
        published_ms: published_ms,
            excerpt: excerpt || null,
            score: s
          });
        }
      }
    }

    if (rank_mode === "recent") {
      matches.sort((a, b) => ((b.published_ms ?? 0) - (a.published_ms ?? 0)) || (b.score - a.score));
    } else {
      matches.sort((a, b) => (b.score - a.score) || ((b.published_ms ?? 0) - (a.published_ms ?? 0)));
    }

    const out = matches.slice(0, max_matches);

    return NextResponse.json(
      {
        ok: true,
        started,
        version,
        q_raw: q0,
        q,
        ids_used: ids && ids.length ? ids : null,
        n_items_per_feed,
        timeout_ms,
        feeds_n: data.feeds.length,
        scanned_items_n: scanned,
        matches_n: out.length,
        matches: out
      },
      { status: 200, headers: { "x-rss-scan-version": version, "cache-control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e), started, version },
      { status: 500, headers: { "x-rss-scan-version": version, "cache-control": "no-store" } }
    );
  }
}