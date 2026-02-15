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


function normalizeWebQuery(message: string): string {
  let q = (message || "").trim();

  // If user used "Use web:" prefix, prefer substring after it.
  const m = q.match(/^\s*use\s+web\s*:\s*(.+)$/i);
  if (m?.[1]) q = m[1].trim();

  // Remove common "cite sources" instruction tails
  q = q.replace(/\b(cite\s+sources?|cite)\b.*$/i, "").trim();

  // Trim trailing punctuation
  q = q.replace(/[.!,;:\s]+$/g, "").trim();

  // Collapse whitespace
  q = q.replace(/\s+/g, " ").trim();

  return q;
}
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
  const version = "hx2-chat-send-clean-v6";
  let sources: any[] = [];
  try {
    const body = await req.json().catch(() => ({} as any));
    const msg =
      body?.message ??
      body?.text ??
      body?.input ??
      body?.prompt ??
      body?.content ??
      "";

    
    const webQuery = normalizeWebQuery(msg);
const useWeb = shouldUseWeb(String(msg || ""));
    let sources: WebSource[] = [];
    let provider: string | null = null;

    // --- debug ---
    let search_url = "";
    let search_status: number | null = null;
    let search_content_type: string | null = null;
    let search_text_head: string | null = null;
    let ws_ok: boolean | null = null;
    let ws_results_n: number | null = null;

    if (useWeb) {
      const q = String(msg || "").replace(/^use web:\s*/i, "").trim() || String(msg || "");

      // IMPORTANT: build URL from req.url (no origin string concat)
      const u = new URL("/api/web/search", req.url);
      search_url = u.toString();

      const sr = await fetch(u, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  cache: "no-store",
  body: JSON.stringify({ q, n: 5 }),
  redirect: "follow",
});

search_status = sr.status;
search_content_type = sr.headers.get("content-type") || null;

let ws: any = null;
let results: any[] = [];
try {
  ws = await sr.json();
  ws_ok = !!ws?.ok;
  results = Array.isArray(ws?.results) ? ws.results : [];
  ws_results_n = results.length;
} catch (e: any) {
  ws_ok = false;
  ws_results_n = 0;
}
      let sent_q: string | null = null;
      sent_q = q;
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

    const target = "https://ap2-worker.optinodeiq.com/brain/chat";
    const fr = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hx2-session": req.headers.get("x-hx2-session") || "",
      },
      cache: "no-store",
      body: JSON.stringify({
        message: String(msg || "") + web_context,
        web: { use_web: useWeb, provider, sources_n: sources.length },
        sources,
      }),
    });

    const data = await fr.json().catch(() => ({}));

    return NextResponse.json(
      {
        ok: true,
        forwarded: true,
        url: target,
        data,
        sources,
        web: {
          use_web: useWeb,
          provider,
          sources_n: sources.length,
          debug: {
            
          sent_q: webQuery,
search_url,
            search_status,
            search_content_type,
            search_text_head,
            ws_ok,
            ws_results_n,
          },
        },
      },
      { status: 200, headers: { "x-chat-route-version": version, "cache-control": "no-store" } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || String(e) },
      { status: 500, headers: { "x-chat-route-version": version, "cache-control": "no-store" } }
    );
  }
}