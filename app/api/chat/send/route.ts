/*  */
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

function buildWebContext(sources: sourcesFromWebNorm
  if (!sources.length) return "";
  const lines = sources.map((s, i) => {
    const t = s.title ? ` — ${s.title}` : "";
    const ex = s.excerpt ? `\nEXCERPT: ${s.excerpt}` : "";
    return `SOURCE ${i + 1}: ${s.url}${t}\nFETCHED_AT: ${s.fetched_at || ""}${ex}`;
  });
  return `\n\n[WEB_CONTEXT]\nUse these sources for up-to-date facts. If you rely on a claim, cite the SOURCE number.\n\n${lines.join("\n\n")}\n`;
}

export async function POST(req: NextRequest) {  // --- WEB VARS (hoisted for catch) ---
  let HX2_WEB_ENABLED = false;
  let explicitUrls: string[] = [];
  let wantsWeb = false;
  let useWeb = false;
  // --- /WEB VARS ---

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
    
  
  // 
  let webHits: any[] = [];
  try {
    if (useWeb) {
      webHits = await hx2WebSearch(req.url, message: messageForBrain, 5);
    }
  } catch (e) {
    webHits = [];
  }

  const webContext =
    useWeb && webHits.length
      ? "\n\nWEB_RESULTS (use these as sources; cite by URL):\n" +
        webHits
          .map((h: any, i: number) =>
            - [\] \ — \\\
          )
          .join("\n")
      : "";

  const messageForBrain = message + webContext;
  // /
// 
  let webHits: any[] = [];
  try {
    if (useWeb) {
      webHits = await hx2WebSearch(req.url, message: messageForBrain, 5);
    }
  } catch (e) {
    webHits = [];
  }

  const webContext =
    useWeb && webHits.length
      ? "\n\nWEB_RESULTS (use these as sources; cite by URL):\n" +
        webHits
          .map((h: any, i: number) =>
            - [\] \ — \\\
          )
          .join("\n")
      : "";

  const messageForBrain = message + webContext;
  // /
// HX2_WEB_CONTEXT v0.6
    // If web is requested, fetch hits and append to the message sent to brain.
    let webHits: WebHit[] = [];
    try {
      if (useWeb) {
        webHits = await hx2WebSearch(req.url, message: messageForBrain, 5);
      }
    } catch (e) {
      webHits = [];
    }

    // Stop-the-bleeding: if web requested but no hits, do NOT forward
    if (useWeb && (!webHits || webHits.length === 0)) {
      return NextResponse.json(
        {
          ok: false,
          error: "web requested but returned 0 results",
          web: { want_web: wantsWeb, use_web: useWeb, auto_web: false, explicit_urls: explicitUrls.length },
          sources: sourcesFromWebNorm
        },
        { status: 502 }
      );
    }

    const sourcesFromWeb = Array.isArray(webHits)
      ? webHits.map((h: any) => ({
          title: String(h.title || ""),
          url: String(h.url || ""),
          ts: h.ts ? String(h.ts) : undefined,
          source: h.source ? String(h.source) : "web",
        }))
      : [];

    const webContext =
      useWeb && webHits.length
        ? "\n\nWEB_RESULTS (use these as sources; cite only these URLs):\n" +
          webHits
            .map((h: any, i: number) => `- [${i + 1}] ${String(h.title || "").trim()} — ${String(h.url || "").trim()}`)
            .join("\n")
        : "";

    const messageForBrain = message + webContext;


    // /HX2_WEB_CONTEXT v0.6


    
    
    // HX2_WEB_CONTEXT v0.4
    let webHits: WebHit[] = [];
    try {
      if (useWeb) {
        webHits = await hx2WebSearch(req.url, message: messageForBrain, 5);
      }
    } catch (e) {
      webHits = [];
    }

    const sourcesFromWeb = Array.isArray(webHits)
      ? webHits.map((h: any) => ({
          title: String(h.title || ""),
          url: String(h.url || ""),
          ts: h.ts ? String(h.ts) : undefined,
          source: h.source ? String(h.source) : "web",
        }))
      : [];

    // HARD SAFETY: if web requested but 0 hits, block (prevents fake citations)
    if (useWeb && (!webHits || webHits.length === 0)) {
      return NextResponse.json(
        {
          ok: false,
          error: "web requested but returned 0 results",
          web: { want_web: wantsWeb, use_web: useWeb, auto_web: false, explicit_urls: explicitUrls.length },
          sources: sourcesFromWebNorm,
        },
        { status: 502 }
      );
    }

    const webContext =
      useWeb && webHits.length
        ? "\n\nWEB_RESULTS (use these as sources; cite by URL):\n" +
          webHits
            .map((h: any, i: number) =>
              `- [${i + 1}] ${String(h.title || "").trim()} — ${String(h.url || "").trim()}${h.ts ? " — " + String(h.ts) : ""}${h.source ? " — " + String(h.source) : ""}`
            )
            .join("\n")
        : "";

    const messageForBrain = message + webContext;
    // /HX2_WEB_CONTEXT v0.4
// HX2_WEB_CONTEXT v0.3 (absolute URL + safe injection + sources)
    const __hx2_web_enabled = String(process.env.HX2_WEB_ENABLED || "").toLowerCase() === "true";
    const __hx2_msg_urls: string[] = (message.match(/https?:\/\/\S+/g) || []).map((u) => String(u));
    const __hx2_body_urls: string[] = Array.isArray((body as any)?.web_urls)
      ? (body as any).web_urls.map((u: any) => String(u))
      : [];

    const __hx2_explicit_urls: string[] = Array.from(new Set([ ...__hx2_msg_urls, ...__hx2_body_urls ]));

    const __hx2_wants_web =
      __hx2_web_enabled &&
      /(\buse web\b|\btoday\b|\blatest\b|\bcurrent\b|\bnow\b|\bwho won\b|\bscore\b|\bprice\b|\bnews\b|\bheadline\b|\bbreaking\b|\bupdate\b)/i.test(message);

    const __hx2_use_web =
      Boolean((body as any)?.use_web) || __hx2_wants_web || (__hx2_explicit_urls.length > 0);

    let __hx2_web_hits: any[] = [];
    try {
      if (__hx2_use_web) {
        // Search using the user's question (message) by default
        __hx2_web_hits = await hx2WebSearch(req.url, message: messageForBrain, 5);
      }
    } catch (e) {
      __hx2_web_hits = [];
    }

    // Optional hard safety: if web requested but no hits, block to reduce hallucinations
    if (__hx2_use_web && (!__hx2_web_hits || __hx2_web_hits.length === 0)) {
      return NextResponse.json(
        {
          ok: false,
          error: "web requested but returned 0 results",
          web: { want_web: __hx2_wants_web, use_web: __hx2_use_web, auto_web: false, explicit_urls: __hx2_explicit_urls.length },
          sources: sourcesFromWebNorm
        },
        { status: 502 }
      );
    }

    const __hx2_web_context =
      __hx2_use_web && __hx2_web_hits.length
        ? "\n\nWEB_RESULTS (use these as sources; cite by URL):\n" +
          __hx2_web_hits
            .map((h: any, i: number) =>
              `- [${i + 1}] ${String(h.title || "").trim()} — ${String(h.url || "").trim()}${h.ts ? " — " + String(h.ts) : ""}${h.source ? " — " + String(h.source) : ""}`
            )
            .join("\n")
        : "";

    const messageForBrain = message + __hx2_web_context;

    const sourcesFromWeb = Array.isArray(__hx2_web_hits)
      ? __hx2_web_hits.map((h: any) => ({
          title: String(h.title || ""),
          url: String(h.url || ""),
          ts: h.ts ? String(h.ts) : undefined,
          source: h.source ? String(h.source) : "web",
        }))
      : [];
    // /HX2_WEB_CONTEXT v0.3
// --- WEB FLAGS (v0.2) ---
    HX2_WEB_ENABLED = String(process.env.HX2_WEB_ENABLED || "").toLowerCase() === "true";

    const msgUrls: string[] = (message.match(/https?:\/\/\S+/g) || []).map((u) => String(u));
    const bodyUrls: string[] = Array.isArray((body as any)?.web_urls)
      ? (body as any).web_urls.map((u: any) => String(u))
      : [];

    explicitUrls = Array.from(new Set([...msgUrls, ...bodyUrls]));

    wantsWeb = HX2_WEB_ENABLED &&
      /(\buse web\b|\btoday\b|\blatest\b|\bcurrent\b|\bnow\b|\bwho won\b|\bscore\b|\bprice\b|\bnews\b|\bheadline\b|\bbreaking\b|\bupdate\b)/i
        .test(message);

    useWeb = wantsWeb || (explicitUrls.length > 0);
    // --- /WEB FLAGS ---
    if (!message) {
      return NextResponse.json({ web: { want_web: __hx2_wants_web, use_web: __hx2_use_web, auto_web: false, explicit_urls: explicitUrls.length }, ok: false, error: "missing message" }, { status: 400 });
    }

    const session = req.headers.get("x-hx2-session") || "";
        const sourcesFromWeb = Array.isArray(webHits)
      ? webHits.map((h: any) => ({
          title: String(h.title || ""),
          url: String(h.url || ""),
          ts: h.ts ? String(h.ts) : undefined,
          source: h.source ? String(h.source) : "web",
        }))
      : [];
const sources: sourcesFromWebNorm

    if (useWeb) {
      let urls = explicitUrls.filter(Boolean);

      if (urls.length === 0) {
        // search based on the user question
        const found = await webSearch(req.url, message: messageForBrain, 3);
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
    return NextResponse.json({ web: { want_web: __hx2_wants_web, use_web: __hx2_use_web, auto_web: false, explicit_urls: explicitUrls.length },
      ok: upstream.ok,
      forwarded: true,
      url: upstreamUrl,
      data,
      sources: sourcesFromWebNorm,
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ web: { want_web: __hx2_wants_web, use_web: __hx2_use_web, auto_web: false, explicit_urls: explicitUrls.length }, ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}