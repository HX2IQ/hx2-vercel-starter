import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function fetchWikipediaSummary(query: string) {
  const title = encodeURIComponent(query.trim().replace(/\s+/g, "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;

  const res = await fetch(url, {
    headers: {
      "accept": "application/json",
      "user-agent": "HX2/1.0",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      ok: false,
      source: "wikipedia",
      error: `Wikipedia lookup failed (${res.status})`,
    };
  }

  const json = await res.json().catch(() => ({}));

  return {
    ok: true,
    source: "wikipedia",
    title: json?.title || query,
    summary: json?.extract || "",
    url: json?.content_urls?.desktop?.page || "",
  };
}

async function fetchRssFeed(feedUrl: string) {
  const res = await fetch(feedUrl, {
    headers: {
      "user-agent": "HX2/1.0",
      "accept": "application/rss+xml, application/xml, text/xml",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return {
      ok: false,
      source: "rss",
      error: `RSS fetch failed (${res.status})`,
    };
  }

  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .slice(0, 8)
    .map((m) => {
      const block = m[1] || "";
      const title = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i)?.[1] ||
        block.match(/<title>(.*?)<\/title>/i)?.[1] ||
        "").trim();
      const link = (block.match(/<link>(.*?)<\/link>/i)?.[1] || "").trim();
      const desc = (block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i)?.[1] ||
        block.match(/<description>(.*?)<\/description>/i)?.[1] ||
        "").replace(/<[^>]+>/g, "").trim();

      return { title, link, description: desc };
    })
    .filter((x) => x.title || x.link);

  return {
    ok: true,
    source: "rss",
    items,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kind = String(body?.kind || "").trim();
    const query = String(body?.query || "").trim();
    const url = String(body?.url || "").trim();

    if (kind === "wikipedia") {
      if (!query) {
        return NextResponse.json({ ok: false, error: "Missing query" }, { status: 400 });
      }
      return NextResponse.json(await fetchWikipediaSummary(query));
    }

    if (kind === "rss") {
      if (!url) {
        return NextResponse.json({ ok: false, error: "Missing url" }, { status: 400 });
      }
      return NextResponse.json(await fetchRssFeed(url));
    }

    return NextResponse.json({ ok: false, error: "Unsupported source kind" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
