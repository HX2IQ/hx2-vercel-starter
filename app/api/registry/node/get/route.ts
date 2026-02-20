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

    const url = new URL(req.url);
    const id = (url.searchParams.get("id") || url.searchParams.get("nodeId") || "").trim();
    if (!id) return bad(400, "missing_id");

    const raw = await redis.get(`hx2:registry:nodes:${id}`);
    if (!raw) return bad(404, "not_found", { id });

    let node: any = null;
    try { node = JSON.parse(raw as any); } catch { return bad(500, "bad_record_json", { id }); }

    return NextResponse.json(
      { ok: true, route: "registry.node.get", id, node, ts: new Date().toISOString() },
      { status: 200 }
    );
  } catch (e: any) {
    return bad(500, "internal_error", String(e?.message || e));
  }
}

export async function POST() {
  
  const redis = getRedis();

  if (!redis) return bad(500, "redis_not_configured");
return NextResponse.json({ ok: false, error: "method_not_allowed", allow: ["GET"] }, { status: 405 });
}
