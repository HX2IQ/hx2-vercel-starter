import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

export const dynamic = "force-dynamic";

// Use the SAME Redis config as the rest of the app
function getRedis() {
  const url = process.env.REDIS_URL || process.env.KV_URL || "";
  if (!url) return null;
  return new Redis(url, { maxRetriesPerRequest: 2, enableReadyCheck: true });
}

function asJson(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

// IMPORTANT:
// ap2-proof route stores proof in Redis.
// We will read it back here using the same key.
function proofKey(taskId: string) {
  // default key pattern: "ap2:proof:<taskId>"
  // If your ap2-proof route shows a different key, update it here to match.
  return `ap2:proof:${taskId}`;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const taskId = url.searchParams.get("taskId") || "";

  if (!taskId) {
    return asJson(
      { ok: false, status: 400, error: "missing_taskId", message: "Provide taskId as query param." },
      400
    );
  }

  // Optional auth gate (keep consistent with other endpoints)
  const callerAuth = req.headers.get("authorization") || "";
  const serverKey = process.env.HX2_API_KEY || "";
  const okAuth = callerAuth || serverKey;

  if (!okAuth) {
    return asJson(
      { ok: false, status: 401, error: "missing_auth", message: "Missing Authorization and HX2_API_KEY not set." },
      401
    );
  }

  const redis = getRedis();
  if (!redis) {
    return asJson(
      { ok: false, status: 500, error: "missing_redis", message: "REDIS_URL/KV_URL not set on server." },
      500
    );
  }

  try {
    const key = proofKey(taskId);
    const raw = await redis.get(key);
    await redis.quit();

    if (!raw) {
      // Not found yet (still queued or proof not written)
      return asJson({ ok: true, taskId, state: "PENDING", found: false }, 200);
    }

    // proof is usually JSON
    try {
      const parsed = JSON.parse(raw);
      return asJson({ ok: true, taskId, state: "DONE", found: true, proof: parsed }, 200);
    } catch {
      return asJson({ ok: true, taskId, state: "DONE", found: true, proofRaw: raw }, 200);
    }
  } catch (e: any) {
    return asJson(
      { ok: false, status: 500, error: "redis_read_failed", message: String(e?.message ?? e) },
      500
    );
  }
}
