import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(status: number, error: string, detail?: any) {
  return NextResponse.json({ ok: false, error, ...(detail ? { detail } : {}) }, { status });
}

export async function GET(req: Request) {
  
  const redis = getRedis();

  if (!redis) return bad(500, "redis_not_configured");
try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    const expected = (process.env.HX2_API_KEY || "").trim();

    if (!expected) return bad(500, "missing_server_key");
    if (!token || token !== expected) return bad(401, "unauthorized");

    const ids = (await redis.smembers("hx2:registry:nodes:index")) || [];
    const keys = ids.map((id: string) => `hx2:registry:nodes:${id}`);
    const raw = keys.length ? await redis.mget(...keys) : [];

    const missing: string[] = [];
    ids.forEach((id: string, i: number) => {
      if (!raw[i]) missing.push(id);
    });

    return NextResponse.json(
      { ok: true, route: "registry.integrity", indexCount: ids.length, missingCount: missing.length, missing, ts: new Date().toISOString() },
      { status: 200 }
    );
  } catch (e: any) {
    return bad(500, "internal_error", String(e?.message || e));
  }
}
