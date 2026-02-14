import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type WebHit = { title: string; url: string; snippet?: string; source?: string; ts?: string };
type WebSource = { url: string; title?: string; fetched_at?: string; excerpt?: string };

function wantsWeb(message: string): boolean {
  const m = String(message || "").toLowerCase();
  const triggers = [
    "latest","today","yesterday","tomorrow","this week","this month","current",
    "update","news","price","stock","crypto","btc","xrp","earnings",
    "ceo","election","poll","schedule","release","outage","downtime",
    "law","regulation","court","ruling","inflation","rate","fed",
    "use web"
  ];
  return triggers.some(t => m.includes(t));
}

function extractUrls(text: string): string[] {
  const s = String(text || "");
  const re = /https?:\/\/[^\s)>\]]+/gi;
  const m = s.match(re) || [];
  return Array.from(new Set(m.map(x => x.trim()))).filter(Boolean);
}

async function hx2WebSearch(reqUrl: string, q: string, n = 5): Promise<WebHit[]> {
  const endpoint = new URL("/api/web/search", reqUrl).toString();
  const r = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ q, n }),
  });
  const j: any = await r.json().catch(() => null);
  const hits: WebHit[] = Array.isArray(j?.results) ? j.results : [];
  return hits.slice(0, Math.max(1, n));
}

function normalizeSourcesFromHits(hits: WebHit[]): WebSource[] {
  const fetched_at = new Date().toISOString();
  const out: WebSource[] = [];
  const seen = new Set<string>();
  for (const h of hits || []) {
    const url = String(h?.url || "").trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({
      url,
      title: String(h?.title || "").trim() || undefined,
      fetched_at,
      excerpt: h?.snippet ? String(h.snippet).trim() : undefined,
    });
  }
  return out;
}

function buildWebContext(sources: WebSource[]): string {
  if (!Array.isArray(sources) || sources.length === 0) return "";
  const lines = sources.map((s, i) => {
    const t  = s.title ? ` — ${s.title}` : "";
    const fa = s.fetched_at ? String(s.fetched_at) : "";
    const ex = s.excerpt ? `\nEXCERPT: ${s.excerpt}` : "";
    return `SOURCE ${i + 1}: ${s.url}${t}\nFETCHED_AT: ${fa}${ex}`;
  });
  return `\n\n[WEB_CONTEXT]\nUse these sources for up-to-date facts. If you rely on a claim, cite the SOURCE number.\n\n${lines.join("\n\n")}\n`;
}

export async function POST(req: NextRequest) {
  const started_at = new Date().toISOString();

  // tolerant body parsing
  const body = await req.json().catch(() => ({} as any));
  const msg =
    body?.message ??
    body?.text ??
    body?.input ??
    body?.prompt ??
    body?.content ??
    "";

  const message = String(msg || "");

  // decide web usage
  const HX2_WEB_ENABLED = String(process.env.HX2_WEB_ENABLED || "true").toLowerCase() !== "false";
  const explicitUrls = extractUrls(message);
  const want_web = wantsWeb(message);
  const use_web = HX2_WEB_ENABLED && (want_web || explicitUrls.length > 0);

  // --- web search (always populate sources[] when use_web true) ---
  let webHits: WebHit[] = [];
  let sources: WebSource[] = [];
  try {
    if (use_web) {
      const q = explicitUrls.length ? explicitUrls.join(" ") : message;
      webHits = await hx2WebSearch(req.url, q, 5);
      sources = normalizeSourcesFromHits(webHits);
    }
  } catch {
    webHits = [];
    sources = [];
  }

  // forward to brain
  const Up = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";
  const hx2Session = req.headers.get("x-hx2-session") || req.headers.get("X-Hx2-Session") || "";

  const webContext = use_web ? buildWebContext(sources) : "";
  const messageForBrain = message + webContext;

  const r = await fetch(`${Up}/brain/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(hx2Session ? { "x-hx2-session": hx2Session } : {}),
    } as any,
    body: JSON.stringify({ message: messageForBrain }),
  });

  const j = await r.json().catch(() => ({}));
  const reply = String(j?.reply || j?.data?.reply || "");

  return NextResponse.json(
    {
      ok: true,
      forwarded: true,
      url: `${Up}/brain/chat`,
      started_at,
      data: { reply, raw: j },
      sources,
      web: { want_web, use_web, explicit_urls: explicitUrls.length },
    },
    {
      status: 200,
      headers: { "x-chat-route-version": "hx2-chat-send-clean-v2-sources" },
    }
  );
}