import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

function getRedisClient() {
  const url = String(
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    ""
  ).trim();

  const token = String(
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    ""
  ).trim();

  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function GET(req: NextRequest) {
  try {
    const sessionId = String(
      req.nextUrl.searchParams.get("session_id") ||
      req.headers.get("x-hx2-session") ||
      "hx2-default"
    ).trim();

    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json({
        ok: true,
        session_id: sessionId,
        turns: [],
      });
    }

    const key = `hx2:chat:session:${sessionId}`;
    const raw = await redis.lrange(key, 0, 39);

    const turns = (raw || [])
      .map((item: any) => {
        try {
          return typeof item === "string" ? JSON.parse(item) : item;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .reverse();

    return NextResponse.json({
      ok: true,
      session_id: sessionId,
      count: turns.length,
      turns,
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || "failed",
      turns: [],
    });
  }
}
