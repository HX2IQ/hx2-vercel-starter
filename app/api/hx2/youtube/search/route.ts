import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function clean(x: any): string {
  return typeof x === "string" ? x.trim() : "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const q = clean(body?.q || body?.query || body?.text || body?.message);
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
    u.searchParams.set("q", `${q} site:youtube.com`);
    u.searchParams.set("format", "json");
    u.searchParams.set("categories", "videos");
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
          error: `searxng youtube search failed (${r.status})`,
          upstream_status: r.status,
          upstream_body: text.slice(0, 500),
          n: 0,
          results: [],
        },
        { status: 502 }
      );
    }

    const json = JSON.parse(text);
    const results = (Array.isArray(json?.results) ? json.results : [])
      .map((x: any) => {
        const url = clean(x?.url);
        let video_id = "";
        try {
          const parsed = new URL(url);
          video_id =
            parsed.hostname.includes("youtube.com")
              ? clean(parsed.searchParams.get("v"))
              : parsed.hostname === "youtu.be"
              ? clean(parsed.pathname.replace("/", ""))
              : "";
        } catch {}

        return {
          title: clean(x?.title),
          url,
          snippet: clean(x?.content || x?.snippet),
          source: clean(x?.engine || "youtube_search"),
          video_id,
        };
      })
      .filter((x: any) => x.title && x.url && x.video_id)
      .slice(0, limit);

    return NextResponse.json({
      ok: true,
      provider: "searxng_youtube",
      q,
      n: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err), n: 0, results: [] },
      { status: 500 }
    );
  }
}
