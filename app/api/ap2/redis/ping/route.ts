import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in Vercel env
    const redis = Redis.fromEnv();
    const key = "hx2:redis:ping";
    const val = String(Date.now());

    await redis.set(key, val, { ex: 60 });
    const got = await redis.get(key);

    return NextResponse.json({
      ok: true,
      service: "ap2_redis_ping",
      key,
      val,
      got,
      ts: new Date().toISOString()
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, service: "ap2_redis_ping", error: msg, ts: new Date().toISOString() },
      { status: 500 }
    );
  }
}
