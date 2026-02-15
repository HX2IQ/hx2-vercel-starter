import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type WebResult = { url: string; title?: string; excerpt?: string; fetched_at?: string };

function wantsWeb(message: string): boolean {
  const m = (message || "").toLowerCase();
  if (m.includes("use web:")) return true;

  const triggers = [
    "latest","today","yesterday","tomorrow","this week","this month","current",
    "update","news","price","stock","crypto","btc","xrp","earnings",
    "ceo","election","poll","schedule","release","outage","downtime",
    "law","regulation","court","ruling","inflation","rate","fed"
  ];
  return triggers.some(t => m.includes(t));
}

function buildWebContext(sources: WebResult[]): string {
  if (!sources || sources.length === 0) return "";
  const lines = sources.map((s, i) => {
    const t = s.title ? ` — ${s.title}` : "";
    const ex = s.excerpt ? `\nEXCERPT: ${s.excerpt}` : "";
    return `SOURCE ${i + 1}: ${s.url}${t}\nFETCHED_AT: ${s.fetched_at || ""}${ex}`;
  });
  return `\n\n[WEB_CONTEXT]\nUse these sources for up-to-date facts. If you rely on a claim, cite the SOURCE number.\n\n${lines.join("\n\n")}\n`;
}

async function webSearch(reqUrl: string, q: string, n: number): Promise<{ results: WebResult[]; provider?: string }> {
  const u = new URL("/api/web/search", reqUrl).toString();
  const r = await fetch(u, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ q, n }),
  });
  const j: any = await r.json().catch(() => ({}));
  const results: WebResult[] = Array.isArray(j?.results) ? j.results : [];
  return { results, provider: j?.provider };
}

export async function POST(req: NextRequest) {
  const version = "hx2-chat-send-clean-v4";
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
    const useWeb = wantsWeb(message);

    // Seed sources deterministically from /api/web/search when web is requested
    let sources: WebResult[] = [];
    let provider: string | null = null;

    if (useWeb) {
      try {
        const ws = await webSearch(req.url, message, 5);
        sources = ws.results.slice(0, 5);
        provider = ws.provider || null;
      } catch {
        sources = [];
      }
    }

    const web_context = useWeb ? buildWebContext(sources) : "";
    const messageForBrain = message + web_context;

    const Gateway = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";
    const target = `${Gateway}/brain/chat`;

    const fr = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        message: messageForBrain,
        // lightweight debug for the worker (safe)
        web: { use_web: useWeb, sources_n: sources.length, provider },
      }),
    });

    const data: any = await fr.json().catch(() => ({}));

    return NextResponse.json(
      {
        ok: true,
        forwarded: true,
        url: target,
        data,
        sources, // <— always returned when useWeb = true and search succeeded
        web: {
          use_web: useWeb,
          sources_n: sources.length,
          provider,
        },
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
      { ok: false, error: String(e?.message || e || "unknown") },
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