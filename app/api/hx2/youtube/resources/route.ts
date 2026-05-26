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

export async function GET(req: NextRequest) {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json({ ok: false, error: "redis unavailable" }, { status: 503 });
    }

    const videoId = String(req.nextUrl.searchParams.get("video_id") || "").trim();

    if (videoId) {
      const item = await redis.get(getYouTubeResourceItemKey(videoId));
      return NextResponse.json({ ok: true, item });
    }

    const idsRaw = await redis.get(getYouTubeResourceIndexKey());
    const ids = Array.isArray(idsRaw)
      ? idsRaw.map((x: any) => String(x || "").trim()).filter(Boolean)
      : [];

    const items: any[] = [];
    for (const id of ids.slice(0, 25)) {
      const item = await redis.get(getYouTubeResourceItemKey(id));
      if (item) items.push(item);
    }

    return NextResponse.json({ ok: true, count: items.length, items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}




