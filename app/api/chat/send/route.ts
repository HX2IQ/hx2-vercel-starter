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


const msg =
      body?.message ??
      body?.text ??
      body?.input ??
      body?.prompt ??
      body?.content ??
      "";

    // --- BRIDGE_MEMORY_APPEND v0.1 ---
    try {
      const hx2Session =
        req.headers.get("x-hx2-session") ||
        req.headers.get("X-Hx2-Session") ||
        "";

      const mm = /^Store this exact fact to memory:\s*(.+)\s*$/i.exec(String(msg || ""));
      if (mm?.[1]) {
        const fact = mm[1].trim();
        const Up = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";

        await fetch(`${Up}/brain/memory/append`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(hx2Session ? { "x-hx2-session": hx2Session } : {}),
          } as any,
          body: JSON.stringify({ text: fact }),
        });
      }
    } catch (e) {
      // swallow: never break chat if memory append fails
    }
    // --- /BRIDGE_MEMORY_APPEND ---
const message = String(msg || "").trim();
    // --- WEB FLAGS (v0.2) ---
    const HX2_WEB_ENABLED = String(process.env.HX2_WEB_ENABLED || "").toLowerCase() === "true";

    // URLs typed in message
    const msgUrls: string[] = (message.match(/https?:\/\/\S+/g) || []).map((u) => String(u));

    // URLs explicitly passed by caller (optional)
    const bodyUrls: string[] = Array.isArray((body as any)?.web_urls)
      ? (body as any).web_urls.map((u: any) => String(u))
      : [];

    const explicitUrls: string[] = Array.from(new Set([...msgUrls, ...bodyUrls]));

    const wantsWeb =
      HX2_WEB_ENABLED &&
      /(\buse web\b|\btoday\b|\blatest\b|\bcurrent\b|\bnow\b|\bwho won\b|\bscore\b|\bprice\b|\bnews\b|\bheadline\b|\bbreaking\b|\bupdate\b)/i
        .test(message);

    const useWeb = wantsWeb || (explicitUrls.length > 0);
    // --- /WEB FLAGS ---    if (!message) {
      return NextResponse.json({ web: { wantsWeb: wantsWeb, useWeb: useWeb, auto_web: false, explicit_urls: explicitUrls.length }, ok: false, error: "missing message" }, { status: 400 });
    }

    const session = req.headers.get("x-hx2-session") || "";

    const sources: WebSource[] = [];

    if (wantsWeb) {
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
    return NextResponse.json({ web: { wantsWeb: wantsWeb, useWeb: useWeb, auto_web: false, explicit_urls: explicitUrls.length },
      ok: upstream.ok,
      forwarded: true,
      url: upstreamUrl,
      data,
      sources,
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ web: { wantsWeb: wantsWeb, useWeb: useWeb, auto_web: false, explicit_urls: explicitUrls.length }, ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}