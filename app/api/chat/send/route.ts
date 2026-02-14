import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type WebHit = { url?: string; title?: string };
type WebSource = {
  url: string;
  title?: string;
  fetched_at?: string;
  excerpt?: string;
};

function pickMessage(body: any): string {
  return (
    body?.message ??
    body?.text ??
    body?.input ??
    body?.prompt ??
    body?.content ??
    ""
  );
}

function wantsWeb(message: string): boolean {
  const m = String(message || "").toLowerCase();
  const triggers = [
    "use web:", "latest", "today", "yesterday", "tomorrow",
    "current", "news", "price", "stock", "crypto", "btc", "xrp",
    "earnings", "ceo", "election", "poll", "schedule", "release",
    "outage", "downtime", "law", "regulation", "court", "ruling",
  ];
  return triggers.some(t => m.includes(t));
}

function extractUrls(message: string): string[] {
  const s = String(message || "");
  const re = /https?:\/\/[^\s)]+/g;
  const hits = s.match(re) || [];
  return Array.from(new Set(hits.map(u => u.replace(/[.,;]+$/g, ""))));
}

function absBaseFromReq(req: NextRequest): string {
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

async function webSearch(req: NextRequest, q: string, n: number): Promise<WebHit[]> {
  const base = absBaseFromReq(req);
  const r = await fetch(`${base}/api/web/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ q, n }),
  });
  const j = await r.json().catch(() => ({}));
  if (!j?.ok || !Array.isArray(j?.results)) return [];
  return j.results;
}

async function webFetch(req: NextRequest, url: string): Promise<WebSource | null> {
  const base = absBaseFromReq(req);
  const r = await fetch(`${base}/api/web/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ url, max_bytes: 250000 }),
  });
  const j = await r.json().catch(() => ({}));
  if (!j?.ok) {
    return {
      url,
      fetched_at: new Date().toISOString(),
      excerpt: `Fetch failed (${j?.error || j?.status || "unknown"})`,
    };
  }
  return {
    url: j.url || url,
    title: j.title,
    fetched_at: j.fetched_at,
    excerpt: j.excerpt,
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

export async function POST(req: NextRequest) {
  const started_at = new Date().toISOString();
  const session = req.headers.get("x-hx2-session") || "";

  try {
    const body = await req.json().catch(() => ({} as any));
    const message = pickMessage(body);

    const HX2_WEB_ENABLED = (process.env.HX2_WEB_ENABLED || "1") === "1";
    const explicitUrls = extractUrls(message);
    const want_web = wantsWeb(message);
    const use_web = HX2_WEB_ENABLED && (want_web || explicitUrls.length > 0);

    // 1) build sources[]
    let web_hits: WebHit[] = [];
    let sources: WebSource[] = [];

    if (use_web) {
      const q = message.replace(/^use web:\s*/i, "").trim() || message.trim();
      web_hits = await webSearch(req, q, 5);

      // Seed sources from search hits FIRST (so smoke test passes even if fetch fails)
      sources = web_hits
        .map(h => ({ url: String(h?.url || "").trim(), title: String(h?.title || "").trim() }))
        .filter(s => s.url);

      // If user provided explicit URLs, include them too (dedupe)
      for (const u of explicitUrls) {
        if (!sources.some(s => s.url === u)) sources.push({ url: u });
      }

      // Optional: fetch excerpts for the first 2 sources (keeps latency sane)
      const toFetch = sources.slice(0, 2).map(s => s.url);
      const fetched: WebSource[] = [];
      for (const u of toFetch) {
        const s = await webFetch(req, u);
        if (s) fetched.push(s);
      }

      // Merge fetched back into sources (preserve order)
      sources = sources.map(s => fetched.find(f => f.url === s.url) || s);
    }

    const web_context = buildWebContext(sources);

    // 2) forward to brain
    const target = (process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com") + "/brain/chat";
    const payload = {
      message,
      session,
      web: {
        want_web,
        use_web,
        explicit_urls: explicitUrls.length,
        web_hits_n: web_hits.length,
        sources_n: sources.length,
      },
      web_context,
      sources, // passed to brain too (harmless)
    };

    const fr = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hx2-session": session },
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    const data = await fr.json().catch(() => ({ ok: false, reply: "" }));

    return NextResponse.json(
      {
        ok: true,
        forwarded: true,
        url: target,
        started_at,
        data: { reply: data?.reply ?? data?.data?.reply ?? "", raw: data },
        sources, // ✅ ALWAYS returned when use_web=true
        web: payload.web,
      },
      { headers: { "x-chat-route-version": "hx2-chat-send-clean-v3" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e), started_at },
      { status: 500, headers: { "x-chat-route-version": "hx2-chat-send-clean-v3" } }
    );
  }
}