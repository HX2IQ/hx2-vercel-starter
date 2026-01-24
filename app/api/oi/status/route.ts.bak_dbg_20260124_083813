import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function safeJsonParse(s: any) {
  if (typeof s !== "string") return s;
  try { return JSON.parse(s); } catch { return s; }
}

export async function GET() {
  const base = process.env.HX2_BASE_URL || "https://optinodeiq.com";
  let hx2_ok = false;
  let hx2_code = 0;

  try {
    const r = await fetch(`${base}/api/hx2_base`, {
      headers: process.env.HX2_API_KEY ? { Authorization: `Bearer ${process.env.HX2_API_KEY}` } : {},
      cache: "no-store",
    });
    hx2_code = r.status;
    hx2_ok = r.ok;
  } catch {
    hx2_ok = false;
    hx2_code = 0;
  }

  const redis = redisClient();

  let hb: any = null;
  let last_seen_seconds: number | null = null;

  let depth: number | null = null;
  let enqueued: number | null = null;
  let done: number | null = null;
  let failed: number | null = null;

  let recent: any[] = [];

  if (redis) {
    try {
      hb = await redis.get("ap2:heartbeat");
      if (hb && typeof hb === "string") hb = safeJsonParse(hb);
      if (hb?.ts) last_seen_seconds = Math.max(0, Math.round((Date.now() - Number(hb.ts)) / 1000));

      depth = (await redis.get<number>("ap2:queue:depth")) ?? null;
      enqueued = (await redis.get<number>("ap2:tasks:enqueued")) ?? null;
      done = (await redis.get<number>("ap2:tasks:done")) ?? null;
      failed = (await redis.get<number>("ap2:tasks:failed")) ?? null;

      const list = (await redis.lrange("ap2:tasks:recent", 0, 9)) as any[] || [];
      recent = list.map(safeJsonParse);
    } catch {
      // keep nulls if Redis errors
    }
  }

  return NextResponse.json({
    hx2_base: { ok: hx2_ok, code: hx2_code },
    ap2_worker: { ok: last_seen_seconds !== null ? last_seen_seconds < 60 : null, last_seen_seconds },
    queue: { depth, enqueued, done, failed },
    recent,
    ts: Date.now(),
  });
}
