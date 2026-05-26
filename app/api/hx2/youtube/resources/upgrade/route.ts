import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

const MAX_YOUTUBE_RESOURCE_TRANSCRIPT_BYTES = 250000;

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

function clean(s: unknown) {
  return String(s || "").trim();
}

function clampTranscript(text: string) {
  const s = clean(text);
  return s.length > MAX_YOUTUBE_RESOURCE_TRANSCRIPT_BYTES
    ? s.slice(0, MAX_YOUTUBE_RESOURCE_TRANSCRIPT_BYTES)
    : s;
}

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  return { ok: res.ok, status: res.status, data };
}

export async function POST(req: NextRequest) {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json({ ok: false, error: "redis unavailable" }, { status: 503 });
    }

    const body = await req.json().catch(() => ({} as any));
    const videoId = clean(body?.video_id);

    if (!videoId) {
      return NextResponse.json({ ok: false, error: "missing video_id" }, { status: 400 });
    }

    const key = getYouTubeResourceItemKey(videoId);
    const existing: any = await redis.get(key);

    if (!existing) {
      return NextResponse.json({ ok: false, error: "resource not found" }, { status: 404 });
    }

    const baseUrl =
      process.env.BASE_URL ||
      req.nextUrl.origin ||
      "https://optinodeiq.com";

    const transcriptRes = await postJson(baseUrl + "/api/hx2/youtube/transcript", {
      video_id: videoId,
    });

    if (!transcriptRes?.data?.ok) {
      return NextResponse.json({
        ok: true,
        upgraded: false,
        reason: "transcript unavailable",
        item: existing,
      });
    }

    const fullText = clampTranscript(transcriptRes?.data?.full_text || "");
    const excerpt = clean(transcriptRes?.data?.excerpt || existing?.excerpt || "");

    if (!fullText) {
      return NextResponse.json({
        ok: true,
        upgraded: false,
        reason: "empty transcript",
        item: existing,
      });
    }

    const updated = {
      ...existing,
      transcript_available: true,
      transcript_text: fullText,
      transcript_chars: fullText.length,
      excerpt,
      upgraded_at: new Date().toISOString(),
    };

    await redis.set(key, updated);

    return NextResponse.json({
      ok: true,
      upgraded: true,
      item: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
