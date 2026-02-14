import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type WebHit = { title: string; url: string; snippet?: string; source?: string; ts?: string };
type WebSource = { url: string; title?: string; fetched_at?: string; excerpt?: string };

function wantsWebByHeuristic(message: string): boolean {
  const m = (message || "").toLowerCase();
  const triggers = [
    "use web:", "latest", "today", "yesterday", "tomorrow", "this week", "current",
    "update", "news", "price", "stock", "crypto", "earnings", "ceo", "election",
    "schedule", "release", "outage", "law", "regulation", "court", "ruling",
    "inflation", "rate", "fed",
  ];
  return triggers.some(t => m.includes(t));
}

function extractExplicitUrls(message: string): string[] {
  const m = String(message || "");
  const re = /https?:\/\/[^\s)>\]]+/gi;
  const hits = m.match(re) || [];
  // de-dupe while keeping order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of hits) {
    const uu = u.trim();
    if (!uu) continue;
    if (seen.has(uu)) continue;
    seen.add(uu);
    out.push(uu);
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
  return hits
    .map((h: any) => ({
      title: String(h?.title || "").trim(),
      url: String(h?.url || "").trim(),
      snippet: h?.snippet ? String(h.snippet) : undefined,
      source: h?.source ? String(h.source) : "web",
      ts: h?.ts ? String(h.ts) : undefined,
    }))
    .filter(h => h.url)
    .slice(0, Math.max(1, n));
}

// Optional: fetch excerpts if you have /api/web/fetch implemented; otherwise we return url+title only.
async function webFetch(reqUrl: string, url: string): Promise<WebSource | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(reqUrl).origin;
  const endpoint = new URL("/api/web/fetch", base).toString();
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ url, max_bytes: 250000 }),
    });
    const j: any = await r.json().catch(() => null);
    if (!j?.ok) return { url, fetched_at: new Date().toISOString(), excerpt: `Fetch failed (${j?.error || j?.status || "unknown"})` };
    return {
      url: String(j.url || url),
      title: j.title ? String(j.title) : undefined,
      fetched_at: j.fetched_at ? String(j.fetched_at) : new Date().toISOString(),
      excerpt: j.excerpt ? String(j.excerpt) : undefined,
    };
  } catch (e: any) {
    return { url, fetched_at: new Date().toISOString(), excerpt: `Fetch exception (${String(e?.message || e)})` };
  }
}

export async function POST(req: NextRequest) {
  const Gateway = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";

  // --- WEB VARS (hoisted for catch) ---
  let want_web = false;
  let use_web = false;
  let explicit_urls: string[] = [];
  let sourcesFromWeb: Array<{ url: string; title?: string; source?: string; ts?: string }> = [];
  // --- /WEB VARS ---

  try {
    const body = await req.json().catch(() => ({} as any));

    const msg =
      body?.message ??
      body?.text ??
      body?.input ??
      body?.prompt ??
      body?.content ??
      "";

    const message = String(msg || "");

    // --- web decision ---
    explicit_urls = extractExplicitUrls(message);
    want_web = wantsWebByHeuristic(message);
    use_web = want_web;

    // --- bridge memory append (optional behavior) ---
    try {
      const hx2Session = req.headers.get("x-hx2-session") || req.headers.get("X-Hx2-Session") || "";
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
      // ignore
    }

    // --- web search hits (URLs + titles) ---
    let webHits: WebHit[] = [];
    if (use_web) {
      webHits = await hx2WebSearch(req.url, message, 5);
      sourcesFromWeb = webHits.map(h => ({
        url: h.url,
        title: h.title,
        source: h.source || "web",
        ts: h.ts,
      }));
    }

    // Optional: fetch excerpts for the top URLs if /api/web/fetch exists
    let fetchedSources: WebSource[] = [];
    if (use_web && sourcesFromWeb.length > 0) {
      const top = sourcesFromWeb.slice(0, 3).map(s => s.url);
      for (const u of top) {
        const s = await webFetch(req.url, u);
        if (s) fetchedSources.push(s);
      }
      if (fetchedSources.length === 0) {
        fetchedSources = sourcesFromWeb.map(s => ({ url: s.url, title: s.title }));
      }
    }

    const webContext = use_web ? buildWebContext(fetchedSources) : "";

    const messageForBrain = message + webContext;

    const forwardRes = await fetch(`${Gateway}/brain/chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(req.headers.get("x-hx2-session") ? { "x-hx2-session": req.headers.get("x-hx2-session") as string } : {}),
      } as any,
      body: JSON.stringify({ message: messageForBrain }),
    });

    const data = await forwardRes.json().catch(() => ({} as any));
    const reply = String(data?.reply ?? data?.data?.reply ?? "");

    return NextResponse.json(
      {
        ok: true,
        forwarded: true,
        url: `${Gateway}/brain/chat`,
        data: { reply, raw: data },
        sources: sourcesFromWeb,
        web: { want_web, use_web, explicit_urls: explicit_urls.length },
      },
      { status: 200, headers: { "x-chat-route-version": "patchops-ready-chat-send-v1" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: String(e?.message || e),
        sources: sourcesFromWeb,
        web: { want_web, use_web, explicit_urls: explicit_urls.length },
      },
      { status: 500, headers: { "x-chat-route-version": "patchops-ready-chat-send-v1" } }
    );
  }
}