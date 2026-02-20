import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(status: number, error: string, detail?: any) {
  return NextResponse.json({ ok: false, error, ...(detail ? { detail } : {}) }, { status });
}

function authOk(req: Request) {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const expected = (process.env.HX2_API_KEY || "").trim();
  if (!expected) return { ok: false, res: bad(500, "missing_server_key") };
  if (!token || token !== expected) return { ok: false, res: bad(401, "unauthorized") };
  return { ok: true as const };
}

export async function POST(req: Request) {
  
  const redis = getRedis();

  if (!redis) return bad(500, "redis_not_configured");
const a = authOk(req);
  if (!a.ok) return a.res;

  try {
    const body = await req.json().catch(() => ({}));
    const id = String(body?.id || "").trim();
    if (!id) return bad(400, "missing_id");

    const key = `hx2:registry:nodes:${id}`;

    await redis.del(key);
    await redis.srem("hx2:registry:nodes:index", id);

    return NextResponse.json({ ok: true, deleted: true, id, ts: new Date().toISOString() }, { status: 200 });
  } catch (e: any) {
    return bad(500, "internal_error", String(e?.message || e));
  }
}

export async function GET() {
  
  const redis = getRedis();

  if (!redis) return bad(500, "redis_not_configured");
return NextResponse.json({ ok: false, error: "method_not_allowed", allow: ["POST"] }, { status: 405 });
}
