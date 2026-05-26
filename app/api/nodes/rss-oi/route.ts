import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import feeds from "@/config/rss-feeds.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FeedDef = {
  id: string;
  title: string;
  url: string;
  category: string;
  tier: number;
  confidence: number;
  node_targets: string[];
};

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "OptinodeIQ-HX2-RSS/1.0"
  }
});

function ok(data: any) {
  return NextResponse.json({ ok: true, ...data, ts: new Date().toISOString() });
}

function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message, ts: new Date().toISOString() }, { status });
}

function normalizeItem(item: any) {
  return {
    title: item?.title ?? null,
    link: item?.link ?? null,
    pubDate: item?.pubDate ?? item?.isoDate ?? null,
    contentSnippet: item?.contentSnippet ?? null,
    categories: item?.categories ?? []
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const feedId = searchParams.get("feed");
  const limit = Math.max(1, Math.min(Number(searchParams.get("limit") || "10"), 25));

  if (!feedId) {
    return ok({
      service: "rss-oi", feeds: (feeds as any[]).filter((f) => f.enabled !== false),
      usage: {
        list: "/api/nodes/rss-oi",
        fetch: "/api/nodes/rss-oi?feed=reuters_world&limit=5"
      }
    });
  }

  const feed = (feeds as FeedDef[]).find((f: any) => f.id === feedId && f.enabled !== false);
  if (!feed) return fail(`Unknown feed: ${feedId}`, 404);

  try {
    const parsed = await parser.parseURL(feed.url);
    const items = (parsed.items || []).slice(0, limit).map(normalizeItem);

    return ok({
      service: "rss-oi",
      feed,
      count: items.length,
      items
    });
  } catch (err: any) {
    return fail(`RSS fetch failed for ${feedId}: ${err?.message || String(err)}`, 502);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const feedId = body?.feed ?? null;
  const limit = Math.max(1, Math.min(Number(body?.limit || 10), 25));

  if (!feedId) {
    return fail("feed is required");
  }

  const feed = (feeds as FeedDef[]).find((f: any) => f.id === feedId && f.enabled !== false);
  if (!feed) return fail(`Unknown feed: ${feedId}`, 404);

  try {
    const parsed = await parser.parseURL(feed.url);
    const items = (parsed.items || []).slice(0, limit).map(normalizeItem);

    return ok({
      service: "rss-oi",
      received: {
        feed: feedId,
        limit
      },
      feed,
      count: items.length,
      items
    });
  } catch (err: any) {
    return fail(`RSS fetch failed for ${feedId}: ${err?.message || String(err)}`, 502);
  }
}

