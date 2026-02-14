import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type WebResult = { title: string; url: string; snippet?: string; source?: string; ts?: string };

type WebSource = {
  url: string;
  title?: string;
  fetched_at?: string;
  excerpt?: string;
};

// Keep this small: trigger web only when user asks for recency/news/facts
function wantsWebSearch(message: string): boolean {
  const m = String(message || "").toLowerCase();
  const triggers = [
    "use web", "browse", "search the web", "latest", "today", "yesterday", "tomorrow",
    "current", "update", "news", "price", "stock", "crypto", "btc", "xrp",
    "earnings", "ceo", "election", "poll", "schedule", "release",
    "law", "regulation", "court", "ruling",
  ];
  return triggers.some(t => m.includes(t));
}

async function hx2WebSearch(reqUrl: string, q: string, n = 5): Promise<WebResult[]> {
  const endpoint = new URL("/api/web/search", reqUrl).toString();
  const r = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ q, n }),
  });

  const j: any = await r.json().catch(() => null);
  const hits: WebResult[] = Array.isArray(j?.results) ? j.results : [];
  return hits.slice(0, Math.max(1, n));
}

async function webFetch(baseUrl: string, url: string): Promise<WebSource> {
  const endpoint = new URL("/api/web/fetch", baseUrl).toString();
  const r = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ url, max_bytes: 250000 }),
  });

  const j: any = await r.json().catch(() => ({}));
  if (!j?.ok) {
    return {
      url,
      fetched_at: new Date().toISOString(),
      excerpt: `Fetch failed (${j?.error || j?.status || "unknown"})`,
    };
  }

  return {
    url: String(j.url || url),
    title: j.title ? String(j.title) : undefined,
    fetched_at: j.fetched_at ? String(j.fetched_at) : undefined,
    excerpt: j.excerpt ? String(j.excerpt) : undefined,
  };
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

// URL-only sources array returned to caller
function normalizeSourcesFromWeb(hits: WebResult[]): Array<{ url: string; title?: string; ts?: string; source?: string }> {
  const out: Array<{ url: string; title?: string; ts?: string; source?: string }> = [];
  for (const h of hits || []) {
    const url = String((h as any)?.url || "").trim();
    if (!url) continue;
    out.push({
      url,
      title: String((h as any)?.title || "").trim() || undefined,
      ts: (h as any)?.ts ? String((h as any).ts) : undefined,
      source: (h as any)?.source ? String((h as any).source) : undefined,
    });
  }
  // de-dupe by url
  const seen = new Set<string>();
  return out.filter(s => (seen.has(s.url) ? false : (seen.add(s.url), true)));
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

  const hx2Session =
    req.headers.get("x-hx2-session") ||
    req.headers.get("X-Hx2-Session") ||
    "";

  const Gateway = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";
  const Base    = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;

  // --- Memory bridge (optional, your existing behavior) ---
  try {
    const mm = /^Store this exact fact to memory:\s*(.+)\s*$/i.exec(message);
    if (mm?.[1]) {
      const fact = mm[1].trim();
      await fetch(`${Gateway}/brain/memory/append`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(hx2Session ? { "x-hx2-session": hx2Session } : {}),
        } as any,
        body: JSON.stringify({ text: fact }),
      }).catch(() => null);
    }
  } catch {
    // best effort only
  }
  // --- /Memory bridge ---

  // WEB pipeline
  const want_web = wantsWebSearch(message);
  const use_web  = want_web;

  let webHits: WebResult[] = [];
  let sourcesFromWeb: Array<{ url: string; title?: string; ts?: string; source?: string }> = [];
  let webSources: WebSource[] = [];

  if (use_web) {
    try {
      webHits = await hx2WebSearch(req.url, message, 5);
      sourcesFromWeb = normalizeSourcesFromWeb(webHits);

      // fetch up to 3 pages for excerpts/context
      const toFetch = sourcesFromWeb.map(s => s.url).slice(0, 3);
      for (const u of toFetch) {
        const s = await webFetch(Base, u).catch(() => null);
        if (s) webSources.push(s);
      }
    } catch {
      webHits = [];
      sourcesFromWeb = [];
      webSources = [];
    }
  }

  const web_context = use_web ? buildWebContext(webSources) : "";

  // Forward to brain/chat
  const payload = {
    message: message + web_context,
    meta: {
      web: {
        want_web,
        use_web,
        explicit_urls: 0,
      },
      started_at,
    },
  };

  const r = await fetch(`${Gateway}/brain/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(hx2Session ? { "x-hx2-session": hx2Session } : {}),
    } as any,
    body: JSON.stringify(payload),
  });

  const j: any = await r.json().catch(() => null);

  return NextResponse.json(
    {
      ok: true,
      forwarded: true,
      url: `${Gateway}/brain/chat`,
      data: j || { reply: "" },
      web: { want_web, use_web, explicit_urls: 0 },
      sources: sourcesFromWeb, // ✅ THIS is what your smoke test wants
      started_at,
    },
    {
      status: 200,
      headers: {
        "x-chat-route-version": "hx2-chat-send-clean-v1",
        "cache-control": "no-store",
      },
    }
  );
}