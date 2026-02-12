import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type WebResult = {
  title: string;
  url: string;
  snippet?: string;
  source?: string;
};

function asString(x: any): string {
  return typeof x === "string" ? x : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const q = asString(body?.q || body?.query || body?.text || body?.message).trim();

    if (!q) {
      return NextResponse.json(
        { ok: false, error: "missing q", fetched_at: new Date().toISOString(), n: 0, results: [] },
        { status: 400 }
      );
    }

    // --- STOP-THE-BLEEDING SEARCH (no key): Wikipedia OpenSearch ---
    // Returns: [searchTerm, titles[], descriptions[], urls[]]
    const api = new URL("https://en.wikipedia.org/w/api.php");
    api.searchParams.set("action", "opensearch");
    api.searchParams.set("search", q);
    api.searchParams.set("limit", "8");
    api.searchParams.set("namespace", "0");
    api.searchParams.set("format", "json");

    const headers = {
  "accept": "application/json",
  // Wikimedia is strict; serverless IPs get throttled without a UA.
  "user-agent": "OptinodeIQ/0.1 (web-search; contact=ops@optinodeiq.com)"
} as Record<string,string>;

async function doFetch() {
  return fetch(api.toString(), { method: "GET", headers, cache: "no-store" });
}

let r = await doFetch();

// simple backoff for 429 throttles
if (r.status === 429) {
  await new Promise((res) => setTimeout(res, 800));
  r = await doFetch();
}

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return NextResponse.json(
        {
          ok: false,
          error: `upstream wiki failed (${r.status})`,
          upstream_status: r.status,
          upstream_body: text.slice(0, 300),
          q,
          fetched_at: new Date().toISOString(),
          n: 0,
          results: [],
        },
        { status: 502 }
      );
    }

    const data = (await r.json()) as any[];
    const titles: string[] = Array.isArray(data?.[1]) ? data[1].map(String) : [];
    const descs: string[] = Array.isArray(data?.[2]) ? data[2].map(String) : [];
    const urls: string[] = Array.isArray(data?.[3]) ? data[3].map(String) : [];

    const results: WebResult[] = titles.map((t, i) => ({
      title: t,
      url: urls[i] || "",
      snippet: descs[i] || "",
      source: "wikipedia",
    })).filter(x => x.title && x.url);

    return NextResponse.json({
      ok: true,
      q,
      fetched_at: new Date().toISOString(),
      n: results.length,
      results,
      provider: "wikipedia_opensearch",
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e), fetched_at: new Date().toISOString(), n: 0, results: [] },
      { status: 500 }
    );
  }
}