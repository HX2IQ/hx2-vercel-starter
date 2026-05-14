import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

function clean(s: unknown) {
  return String(s || "").trim();
}

function getRedisClient() {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim();
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getWebResourceIdsKey() {
  return "hx2:web:resource:ids";
}

function getWebResourceItemKey(id: string) {
  return `hx2:web:resource:item:${id}`;
}

function tokenize(text: string): string[] {
  const stop = new Set([
    "a","an","and","are","as","at","be","by","for","from","how","i","in","is","it","of","on","or","that","the","this","to","what","with"
  ]);

  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length >= 3 && !stop.has(x));
}

function scoreWebResource(q: string, item: any): number {
  const qTokens = new Set(tokenize(q));
  const text = [
    clean(item?.title),
    clean(item?.snippet),
    clean(item?.query),
    clean(item?.url),
  ].join(" ");

  const itemTokens = new Set(tokenize(text));

  let overlap = 0;
  for (const tok of qTokens) {
    if (itemTokens.has(tok)) overlap++;
  }

  let score = overlap * 10;

  const title = clean(item?.title).toLowerCase();
  const snippet = clean(item?.snippet).toLowerCase();
  const query = clean(item?.query).toLowerCase();
  const qLower = clean(q).toLowerCase();

  if (title.includes(qLower)) score += 25;
  if (snippet.includes(qLower)) score += 15;
  if (query.includes(qLower)) score += 10;

  return score;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const q = clean(body?.q || body?.query || body?.text || body?.message);
    const limitRaw = Number(body?.limit ?? 5);
    const limit = Math.max(1, Math.min(20, Number.isFinite(limitRaw) ? limitRaw : 5));

    if (!q) {
      return NextResponse.json({ ok: false, error: "missing q" }, { status: 400 });
    }

    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json({ ok: false, error: "redis unavailable" }, { status: 503 });
    }

    const ids = await redis.smembers(getWebResourceIdsKey());
    const items: any[] = [];

    for (const id of Array.isArray(ids) ? ids.slice(0, 200) : []) {
      const item = await redis.get(getWebResourceItemKey(String(id)));
      if (item) items.push(item);
    }

    const ranked = items
      .map((item: any) => ({
        ...item,
        _score: scoreWebResource(q, item),
      }))
      .filter((item: any) => item._score > 0)
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
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
