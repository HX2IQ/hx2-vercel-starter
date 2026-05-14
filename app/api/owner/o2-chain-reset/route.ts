import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

export async function POST() {
  try {
    const url =
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.KV_REST_API_URL ||
      "";
    const token =
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      process.env.KV_REST_API_TOKEN ||
      "";

    if (!url || !token) {
      return NextResponse.json({ ok: false, error: "Redis not configured" }, { status: 500 });
    }

    const redis = new Redis({ url, token });

    const keys = [
      "owner:recent_action:regression_smoke",
      "owner:recent_action:postflight",
      "owner:recent_action:deploy",
      "owner:recent_action:owner_summary"
    ];

    for (const key of keys) {
      await redis.del(key);
    }

    const resetAt = new Date().toISOString();
    await redis.set("owner:chain_reset_at", JSON.stringify({ timestamp: resetAt }));

    return NextResponse.json({ ok: true, cleared: keys, reset_at: resetAt });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

