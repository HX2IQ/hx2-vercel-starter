import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type WebSearchResult = { title?: string; url?: string; snippet?: string; source?: string };
type WebSearchResponse = { ok?: boolean; provider?: string; fetched_at?: string; results?: WebSearchResult[] };

type WebSource = {
  url: string;
  title?: string;
  fetched_at?: string;
  excerpt?: string;
};

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
  const version = "hx2-chat-send-clean-v5";
  try {
    // tolerant parse
    const body = await req.json().catch(() => ({} as any));
    const msg =
      body?.message ??
      body?.text ??
      body?.input ??
      body?.prompt ??
      body?.content ??
      "";

    const origin = new URL(req.url).origin;
    const useWeb = shouldUseWeb(String(msg || ""));
    let sources: WebSource[] = [];
    let provider: string | null = null;

    if (useWeb) {
      // Use the SAME host that served this route (prevents env/base mismatch)
      const q = String(msg || "").replace(/^use web:\s*/i, "").trim() || String(msg || "");
      const sr = await fetch(`${origin}/api/web/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ q, n: 5 }),
      });

      const ws = (await sr.json().catch(() => ({}))) as WebSearchResponse;
      provider = ws?.provider || null;

      const results = Array.isArray(ws?.results) ? ws.results : [];
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

    // forward to brain
    const target = "https://ap2-worker.optinodeiq.com/brain/chat";
    const fr = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-hx2-session": req.headers.get("x-hx2-session") || "" },
      cache: "no-store",
      body: JSON.stringify({
        message: String(msg || "") + web_context,
        web: {
          use_web: useWeb,
          provider,
          sources_n: sources.length,
        },
        sources, // send to brain (optional)
      }),
    });

    const data = await fr.json().catch(() => ({}));

    // IMPORTANT: always return our sources[] (do NOT let brain overwrite it)
    return NextResponse.json(
      {
        ok: true,
        forwarded: true,
        url: target,
        data,
        sources,
        web: { use_web: useWeb, provider, sources_n: sources.length },
      },
      {
        status: 200,
        headers: {
          "x-chat-route-version": version,
          "cache-control": "no-store",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || String(e),
      },
      {
        status: 500,
        headers: {
          "x-chat-route-version": version,
          "cache-control": "no-store",
        },
      }
    );
  }
}