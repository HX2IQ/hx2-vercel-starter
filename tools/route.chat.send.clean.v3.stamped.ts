import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type WebHit = { url?: string; title?: string; snippet?: string };
type WebSource = { url: string; title?: string; fetched_at?: string; excerpt?: string };

function wantsWeb(message: string): boolean {
  const m = (message || "").toLowerCase();
  if (m.includes("use web:") || m.includes("use the web") || m.includes("browse") || m.includes("search the web")) return true;
  const triggers = [
    "latest","today","yesterday","tomorrow","this week","this month","current",
    "update","news","price","stock","crypto","btc","xrp","earnings","ceo",
    "election","poll","schedule","release","outage","downtime","law","regulation",
    "court","ruling","inflation","rate","fed"
  ];
  return triggers.some(t => m.includes(t));
}

function extractUrls(message: string): string[] {
  const s = message || "";
  const re = /\bhttps?:\/\/[^\s)]+/gi;
  const hits = s.match(re) || [];
  // de-dupe
  const set = new Set(hits.map(x => x.trim()));
  return Array.from(set);
}

function buildWebContext(sources: WebSource[]): string {
  if (!Array.isArray(sources) || sources.length === 0) return "";
  const lines = sources.map((s, i) => {
    const t = s.title ? ` — ${s.title}` : "";
    const ex = s.excerpt ? `\nEXCERPT: ${s.excerpt}` : "";
    const fa = s.fetched_at ? String(s.fetched_at) : "";
    return `SOURCE ${i + 1}: ${s.url}${t}\nFETCHED_AT: ${fa}${ex}`;
  });
  return `\n\n[WEB_CONTEXT]\nUse these sources for up-to-date facts. If you rely on a claim, cite the SOURCE number.\n\n${lines.join("\n\n")}\n`;
}

async function hx2WebSearch(reqUrl: string, q: string, n: number): Promise<WebHit[]> {
  const origin = new URL(reqUrl).origin;
  const r = await fetch(`${origin}/api/web/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ q, n }),
  });

  const j: any = await r.json().catch(() => ({}));
  if (!j?.ok || !Array.isArray(j?.results)) return [];
  return j.results as WebHit[];
}

export async function POST(req: NextRequest) {
  const startedAt = new Date().toISOString();
  const xChatRouteVersion = "hx2-chat-send-clean-v3-v3-stamp-1771043614";

  // --- WEB VARS (hoisted for catch) ---
  let wantWeb = false;
  let useWeb = false;
  let explicitUrls: string[] = [];
  let webHits: WebHit[] = [];
  let sources: WebSource[] = [];
  // --- /WEB VARS ---

  try {
    const body: any = await req.json().catch(() => ({}));
    const message =
      body?.message ??
      body?.text ??
      body?.input ??
      body?.prompt ??
      body?.content ??
      "";

    const msg = String(message || "");
    wantWeb = wantsWeb(msg);
    explicitUrls = extractUrls(msg);
    useWeb = wantWeb || explicitUrls.length > 0;

    // 1) Seed sources[] from web/search when web is desired
    if (useWeb) {
      webHits = await hx2WebSearch(req.url, msg, 5);

      // Deterministic: always seed sources from hits (even without fetch)
      sources = (webHits || [])
        .map((h: WebHit) => ({
          url: String(h?.url || "").trim(),
          title: String(h?.title || "").trim() || undefined,
          fetched_at: new Date().toISOString(),
          excerpt: String((h as any)?.snippet || "").trim() || undefined,
        }))
        .filter(s => !!s.url);

      // If user provided explicit URLs, include them too (dedupe)
      for (const u of explicitUrls) {
        if (!sources.some(s => s.url === u)) {
          sources.push({ url: u, fetched_at: new Date().toISOString() });
        }
      }
    }

    const web_context = buildWebContext(sources);

    // 2) Forward to brain (unchanged contract: send message; add web_context for better grounding)
    const target = process.env.AP2_GATEWAY_URL
      ? `${process.env.AP2_GATEWAY_URL.replace(/\/+$/,"")}/brain/chat`
      : "https://ap2-worker.optinodeiq.com/brain/chat";

    const fr = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        message: msg + (web_context ? web_context : ""),
        mode: "SAFE",
      }),
    });

    const data: any = await fr.json().catch(() => ({}));

    return NextResponse.json(
      {
        ok: true,
        forwarded: true,
        url: target,
        data,
        sources, // ✅ deterministic sources[] returned from web/search seeding
        web: {
          want_web: wantWeb,
          use_web: useWeb,
          explicit_urls: explicitUrls.length,
          web_hits_n: webHits?.length || 0,
          sources_n: sources?.length || 0,
          started_at: startedAt,
        },
      },
      { headers: { "x-chat-route-version": xChatRouteVersion } }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: String(e?.message || e),
        sources,
        web: {
          want_web: wantWeb,
          use_web: useWeb,
          explicit_urls: explicitUrls.length,
          web_hits_n: webHits?.length || 0,
          sources_n: sources?.length || 0,
          started_at: startedAt,
        },
      },
      { status: 500, headers: { "x-chat-route-version": xChatRouteVersion } }
    );
  }
}