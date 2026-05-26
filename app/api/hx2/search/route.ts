import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SearchItem = {
  title: string;
  url: string;
  snippet?: string;
  source?: string;
};

function clean(x: any): string {
  return typeof x === "string" ? x.trim() : "";
}

function normalizeResults(items: any[]): SearchItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item: any) => ({
      title: clean(item?.title),
      url: clean(item?.url),
      snippet: clean(item?.content || item?.snippet),
      source: clean(item?.engine || item?.source || "searxng"),
    }))
    .filter((x) => x.title && x.url)
    .slice(0, 10);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const q = clean(body?.q || body?.query || body?.text || body?.message);
    const category = clean(body?.category || "general");
    const limit = Math.max(1, Math.min(10, Number(body?.limit ?? 5)));

    if (!q) {
      return NextResponse.json(
        { ok: false, error: "missing q", n: 0, results: [] },
        { status: 400 }
      );
    }

    const baseUrl = clean(process.env.SEARXNG_BASE_URL);
    if (!baseUrl) {
      return NextResponse.json(
        { ok: false, error: "SEARXNG_BASE_URL missing", n: 0, results: [] },
        { status: 500 }
      );
    }

    const u = new URL("/search", baseUrl);
    u.searchParams.set("q", q);
    u.searchParams.set("format", "json");
    u.searchParams.set("categories", category);
    u.searchParams.set("language", "en-US");
    u.searchParams.set("safesearch", "0");

    const r = await fetch(u.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "OptinodeIQ-HX2/1.0",
      },
      cache: "no-store",
    });

    const text = await r.text();
    if (!r.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `searxng failed (${r.status})`,
          upstream_status: r.status,
          upstream_body: text.slice(0, 500),
          n: 0,
          results: [],
        },
        { status: 502 }
      );
    }

    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "searxng returned non-json",
          upstream_body: text.slice(0, 500),
          n: 0,
          results: [],
        },
        { status: 502 }
      );
    }

    const results = normalizeResults(json?.results || []).slice(0, limit);

    return NextResponse.json({
      ok: true,
      provider: "searxng",
      q,
      category,
      fetched_at: new Date().toISOString(),
      n: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || String(err),
        n: 0,
        results: [],
      },
      { status: 500 }
    );
  }
}
