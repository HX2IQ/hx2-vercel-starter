import { NextRequest, NextResponse } from "next/server";

function canonicalizeWebQuery(s: string) {
  let q = (s || "").trim();

  // Remove common directives that hurt search providers
  q = q.replace(/^(use\s+web:\s*)/i, "");
  q = q.replace(/\b(cite\s+sources?|with\s+sources?|provide\s+sources?)\b/ig, " ");

  // Remove trailing punctuation noise
  q = q.replace(/[“”"']/g, "");
  q = q.replace(/[?!.:,;]+/g, " ");

  // Collapse whitespace
  q = q.replace(/\s+/g, " ").trim();

  return q;
}

function fallbackWebQuery(q: string) {
  const s = (q || "").toLowerCase();

  // Known-brittle pattern: question phrasing about Super Bowl
  if (s.includes("super bowl")) return "Super Bowl winner";

  // Generic fallback: strip leading interrogatives if present
  return q
    .replace(/^(who|what|when|where|why|how)\s+/i, "")
    .trim();
}
type RssMatch = {
  feed_id?: string;
  feed_name?: string;
  title?: string;
  url?: string;
  published_at?: string | null;
  published_ms?: number | null;
  score?: number | null;
  excerpt?: string | null;
};

function pickBestRssMatch(matches: any, rankMode: "recent" | "relevance" = "recent"): RssMatch | null {
  if (!Array.isArray(matches) || matches.length < 1) return null;

  let best: RssMatch | null = null;
  for (const m of matches as RssMatch[]) {
    const s  = Number(m?.score ?? 0);
    const pm = Number(m?.published_ms ?? 0);

    if (!best) { best = m; continue; }

    const bs  = Number(best?.score ?? 0);
    const bpm = Number(best?.published_ms ?? 0);

    if (s > bs) { best = m; continue; }
    if (s === bs && rankMode === "recent" && pm > bpm) { best = m; continue; }
  }
  return best;
}

function shouldUseRssPromotion(rawMsg: string): boolean {
  // Default ON unless user explicitly disables.
  // You can later switch this to env-driven if you want.
  const m = (rawMsg || "").toLowerCase();
  if (m.includes("rss: off") || m.includes("use rss: off") || m.includes("rss off")) return false;
  return true;
}

export const runtime = "nodejs";

type WebSearchResult = { title?: string; url?: string; snippet?: string; source?: string };
type WebSearchResponse = { ok?: boolean; provider?: string; fetched_at?: string; results?: WebSearchResult[] };

type WebSource = {
  url: string;
  title?: string;
  fetched_at?: string;
  excerpt?: string;
};


function normalizeWebQuery(message: string): string {
  let q = (message || "").trim();

  // If user used "Use web:" prefix, prefer substring after it.
  const m = q.match(/^\s*use\s+web\s*:\s*(.+)$/i);
  if (m?.[1]) q = m[1].trim();

  // Remove common "cite sources" instruction tails
  q = q.replace(/\b(cite\s+sources?|cite)\b.*$/i, "").trim();

  // Trim trailing punctuation
  q = q.replace(/[.!,;:\s]+$/g, "").trim();

  // Collapse whitespace
  q = q.replace(/\s+/g, " ").trim();

  return q;
}
function shouldUseWeb(message: string): boolean {
  const m = (message || "").toLowerCase();
  if (m.includes("use web:")) return true;
  const triggers = [
    "latest","today","yesterday","tomorrow","current","update","news",
    "price","stock","crypto","btc","xrp","earnings","ceo",
    "election","poll","schedule","release","outage","downtime",
    "law","regulation","court","ruling","inflation","rate","fed",
  ];
  return triggers.some(t => m.includes(t));
}

function buildWebContext(sources: WebSource[]): string {
  if (!sources || sources.length === 0) return "";
  const lines = sources.map((s, i) => {
    const t = s.title ? ` — ${s.title}` : "";
    const ex = s.excerpt ? `\nEXCERPT: ${s.excerpt}` : "";
    return `SOURCE ${i + 1}: ${s.url}${t}\nFETCHED_AT: ${s.fetched_at || ""}${ex}`;
  });
  return `\n\n[WEB_CONTEXT]\nUse these sources for up-to-date facts. If you rely on a claim, cite the SOURCE number.\n\n${lines.join("\n\n")}\n`;
}

export async function POST(req: NextRequest) {
    // --- Web search locals (declare once; mutate later) ---
    const web_n = 5;
    const web_debug: Record<string, any> = {};
    let sent_q: string | null = null;
    // -----------------------------------------------------

  const version = "hx2-chat-send-clean-v6";
  let sources: any[] = [];
  try {
    const body = await req.json().catch(() => ({} as any));
  let msg =
    body?.message ??
      body?.text ??
      body?.input ??
      body?.prompt ??
      body?.content ??
      "";
  
    const Base = process.env.NEXT_PUBLIC_BASE_URL || "https://optinodeiq.com";
// === RSS_PROMOTION_BEGIN ===
  // Promote best RSS match (score-first) into the brain prompt so responses are article-specific.
  let rss_promo: any = null;
  try {
    const rawMsg = String(msg || "");
    if (shouldUseRssPromotion(rawMsg)) {
      const ts = Date.now();
      const rssUrl = `${Base}/api/rss/scan?ts=${ts}`;
      const idsDefault = ["bbc_top","consortium","grayzone","mintpress"];
      const rssBody = {
        q: rawMsg,
        ids: idsDefault,
        n_items_per_feed: 25,
        max_matches: 20,
        timeout_ms: 12000,
        rank_mode: "recent"
      };

      const rssRes = await fetch(rssUrl, {
        method: "POST",
        headers: { "content-type": "application/json", "cache-control": "no-cache" },
        body: JSON.stringify(rssBody)
      });

      const rssText = await rssRes.text();
      let rssJson: any = null;
      try { rssJson = JSON.parse(rssText); } catch { rssJson = { ok: false, error: "rss_non_json", text_head: rssText?.slice?.(0,200) }; }

      const best = pickBestRssMatch(rssJson?.matches, "recent");
      rss_promo = {
        ok: !!rssJson?.ok,
        matches_n: Array.isArray(rssJson?.matches) ? rssJson.matches.length : 0,
        best: best ? { title: best.title, url: best.url, score: best.score, published_at: best.published_at, feed_id: best.feed_id } : null
      };

      if (best?.url) {
        const inject =
          `\n\n[RSS BEST MATCH]\n` +
          `${best.title ? `Title: ${best.title}\n` : ""}` +
          `URL: ${best.url}\n` +
          `${best.published_at ? `Published: ${best.published_at}\n` : ""}` +
          `${(best.score ?? null) !== null ? `Score: ${best.score}\n` : ""}` +
          `\nInstruction: Analyze THIS article. Summarize key claims, assess bias/angle, and list 3 verification steps.\n`;

        msg = rawMsg + inject;
      }
    }
  } catch {
    // swallow; RSS is an enhancer not a hard dependency
  }
  // === RSS_PROMOTION_END ===


    
    const webQuery = normalizeWebQuery(msg);
const useWeb = shouldUseWeb(String(msg || ""));
    let sources: WebSource[] = [];
    let provider: string | null = null;

    // --- debug ---
    let search_url = "";
    let search_status: number | null = null;
    let search_content_type: string | null = null;
    let search_text_head: string | null = null;
    let ws_ok: boolean | null = null;
    let ws_results_n: number | null = null;

    if (useWeb) {
      let q = String(msg || "").replace(/^use web:\s*/i, "").trim() || String(msg || "");
q = q.replace(/\s*cite\s+sources\.?\s*$/i, "").trim();
q = q.replace(/[.?!].*$/, "").trim();

      // IMPORTANT: build URL from req.url (no origin string concat)
      const u = new URL("/api/web/search", req.url);
      search_url = u.toString();

      const sr = await fetch(u, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  cache: "no-store",
  body: JSON.stringify({ q, n: 5 }),
  redirect: "follow",
});

search_status = sr.status;
search_content_type = sr.headers.get("content-type") || null;

let ws: any = null;
let results: any[] = [];
try {
  ws = await sr.json();
  ws_ok = !!ws?.ok;
  results = Array.isArray(ws?.results) ? ws.results : [];
  ws_results_n = results.length;
let sent_q: string | null = null;


  // If provider returns 0 results for question-style queries, retry once with a keyword fallback
  if (ws_ok && ws_results_n === 0 && sent_q) {
    const retry_q = fallbackWebQuery(sent_q);
    if (retry_q && retry_q !== sent_q) {
      try {
        const retryRes = await fetch(search_url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ q: retry_q, n: 5 })
        });
        const retryText = await retryRes.text();
        const retryJson = JSON.parse(retryText);
        const retryResults = Array.isArray(retryJson?.results) ? retryJson.results : [];
        if (retryResults.length > 0) {
          results = retryResults;
          ws_results_n = retryResults.length;
          // expose retry in debug if you keep a debug object
          
        } else {
          
        }
      } catch {
        try { (web_debug as any).retry_failed = true; } catch {}
      }
    }
  }} catch (e: any) {
  ws_ok = false;
  ws_results_n = 0;
}
      sent_q = canonicalizeWebQuery(q);
sources = results
        .map((r) => ({
          url: String(r?.url || ""),
          title: r?.title,
          fetched_at: ws?.fetched_at,
          excerpt: r?.snippet || "",
        }))
        .filter((s) => !!s.url);
    }

    const web_context = buildWebContext(sources);

    const target = "https://ap2-worker.optinodeiq.com/brain/chat";
    const fr = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hx2-session": req.headers.get("x-hx2-session") || "",
      },
      cache: "no-store",
      body: JSON.stringify({
        message: String(msg || "") + web_context,
        web: {
use_web: useWeb, provider, sources_n: sources.length },
        sources,
      }),
    });

    const data = await fr.json().catch(() => ({}));

    return NextResponse.json(
      {
        ok: true,
        forwarded: true,
        url: target,
        data,
        sources,
        web: {
          use_web: useWeb,
          provider,
          sources_n: sources.length,
          debug: {
            
          sent_q: canonicalizeWebQuery(webQuery),
search_url,
            search_status,
            search_content_type,
            search_text_head,
            ws_ok,
            ws_results_n,
          },
        },
      },
      { status: 200, headers: { "x-chat-route-version": version, "cache-control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500, headers: { "x-chat-route-version": version, "cache-control": "no-store" } }
    );
  }
}