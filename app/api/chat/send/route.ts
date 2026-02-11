import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type WebSource = {
  url: string;
  title?: string;
  fetched_at?: string;
  excerpt?: string;
};

function wantsWeb(message: string): boolean {
  const m = message.toLowerCase();
  const triggers = [
    "latest", "today", "yesterday", "tomorrow", "this week", "this month", "current",
    "update", "news", "price", "stock", "crypto", "btc", "xrp", "earnings",
    "ceo", "election", "poll", "schedule", "release", "outage", "downtime",
    "law", "regulation", "court", "ruling", "inflation", "rate", "fed",
  ];
  return triggers.some(t => m.includes(t));
}

async function webSearch(q: string, n = 3): Promise<Array<{ url: string; title: string }>> {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/web/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ q, n }),
  });
  const j = await r.json().catch(() => ({}));
  if (!j?.ok || !Array.isArray(j?.results)) return [];
  return j.results.slice(0, n);
}

async function webFetch(url: string): Promise<WebSource | null> {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/web/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ url, max_bytes: 250000 }),
  });
  const j = await r.json().catch(() => ({}));
  if (!j?.ok) return { url, fetched_at: new Date().toISOString(), excerpt: `Fetch failed (${j?.error || j?.status || "unknown"})` };
  return {
    url: j.url,
    title: j.title,
    fetched_at: j.fetched_at,
    excerpt: j.excerpt,
  };
}

function buildWebContext(sources: WebSource[]): string {
  if (!sources.length) return "";
  const lines = sources.map((s, i) => {
    const t = s.title ? ` — ${s.title}` : "";
    const ex = s.excerpt ? `\nEXCERPT: ${s.excerpt}` : "";
    return `SOURCE ${i + 1}: ${s.url}${t}\nFETCHED_AT: ${s.fetched_at || ""}${ex}`;
  });
  return `\n\n[WEB_CONTEXT]\nUse these sources for up-to-date facts. If you rely on a claim, cite the SOURCE number.\n\n${lines.join("\n\n")}\n`;
}

export async function POST(req: NextRequest) {
  try {
    // tolerant body parsing: supports message/text/input/prompt/content
    const body = await req.json().catch(() => ({} as any));
    
const wantWeb =
  process.env.HX2_WEB_ENABLED === "true" &&
  /today|latest|current|now|who won|score|price|news/i.test(String(body?.message || body?.text || body?.input || ""));
const msg =
      body?.message ??
      body?.text ??
      body?.input ??
      body?.prompt ??
      body?.content ??
      "";

    const message = String(msg || "").trim();
    if (!message) {
      return NextResponse.json({ ok: false, error: "missing message" }, { status: 400 });
    }

    const session = req.headers.get("x-hx2-session") || "";

    const use_web = Boolean(body?.use_web);
    const auto_web = wantsWeb(message);
    const want_web = use_web || auto_web;

    // Optional explicit urls passed in
    const explicitUrls: string[] = Array.isArray(body?.web_urls) ? body.web_urls.map((u: any) => String(u)) : [];

    const sources: WebSource[] = [];

    if (want_web) {
      let urls = explicitUrls.filter(Boolean);

      if (urls.length === 0) {
        // search based on the user question
        const found = await webSearch(message, 3);
        urls = found.map(x => x.url);
      }

      // fetch up to 2 pages (keep it fast)
      const toFetch = urls.slice(0, 2);
      for (const u of toFetch) {
        const s = await webFetch(u);
        if (s) sources.push(s);
      }
    }

    const webContext = buildWebContext(sources);
    const augmented = message + webContext;

    const Gateway = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";

    // Forward to the brain/chat endpoint (SAFE)
    const upstreamUrl = `${Gateway}/brain/chat`;

    const hdrs: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session) hdrs["x-hx2-session"] = session;

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: hdrs,
      cache: "no-store",
      body: JSON.stringify({
        message: augmented,
        mode: body?.mode || "SAFE",
      }),
    });

    const data = await upstream.json().catch(() => ({}));

    // Maintain your current response shape, but add sources.
    return NextResponse.json({
      ok: upstream.ok,
      forwarded: true,
      url: upstreamUrl,
      data,
      sources,
      web: { want_web, use_web, auto_web, explicit_urls: explicitUrls.length },
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}