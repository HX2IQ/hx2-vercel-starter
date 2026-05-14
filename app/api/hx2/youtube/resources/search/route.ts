import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

function getRedisClient() {
  const url = String(
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    ""
  ).trim();

  const token = String(
    process.env.KV_REST_API_TOKEN ||
    process.env.KV_REST_API_READ_ONLY_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    ""
  ).trim();

  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getYouTubeResourceItemKey(videoId: string) {
  return `hx2:youtube:resource:${videoId}`;
}

function getYouTubeResourceIndexKey() {
  return "hx2:youtube:resources:index";
}

function clean(s: unknown) {
  return String(s || "").trim();
}

function tokenize(q: string) {
  return clean(q)
    .toLowerCase()
    .split(/\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function scoreResource(item: any, query: string) {
  const qTokens = tokenize(query);
  const title = clean(item?.title).toLowerCase();
  const excerpt = clean(item?.excerpt).toLowerCase();
  const transcript = clean(item?.transcript_text).toLowerCase();
  const sourceQuery = clean(item?.query).toLowerCase();

  let score = 0;

  for (const tok of qTokens) {
    if (!tok) continue;
    if (title.includes(tok)) score += 6;
    if (excerpt.includes(tok)) score += 4;
    if (sourceQuery.includes(tok)) score += 3;
    if (transcript.includes(tok)) score += 2;
  }

  if (title.includes(clean(query).toLowerCase())) score += 10;
  if (excerpt.includes(clean(query).toLowerCase())) score += 6;

  if (item?.transcript_available) score += 3;
  if (typeof item?.quality_score === "number") score += Math.min(10, Number(item.quality_score) / 5);

  return score;
}

export async function POST(req: NextRequest) {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json({ ok: false, error: "redis unavailable" }, { status: 503 });
    }

    const body = await req.json().catch(() => ({} as any));
    const q = clean(body?.q || body?.query || body?.text || body?.message);
    const limitRaw = Number(body?.limit ?? 5);
    const limit = Math.max(1, Math.min(20, Number.isFinite(limitRaw) ? limitRaw : 5));

    if (!q) {
      return NextResponse.json({ ok: false, error: "missing q", n: 0, results: [] }, { status: 400 });
    }

    const idsRaw = await redis.get(getYouTubeResourceIndexKey());
    const ids = Array.isArray(idsRaw)
      ? idsRaw.map((x: any) => clean(x)).filter(Boolean)
      : [];

    const allItems: any[] = [];
    for (const id of ids.slice(0, 250)) {
      const item = await redis.get(getYouTubeResourceItemKey(id));
      if (item) allItems.push(item);
    }

    const ranked = allItems
      .map((item: any) => ({
        ...item,
        _score: scoreResource(item, q),
      }))
      .filter((item: any) => Number(item?._score || 0) > 0)
      .sort((a: any, b: any) => Number(b?._score || 0) - Number(a?._score || 0))
      .slice(0, limit);

    return NextResponse.json({
      ok: true,
      q,
      n: ranked.length,
      results: ranked,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err), n: 0, results: [] },
      { status: 500 }
    );
  }
}
