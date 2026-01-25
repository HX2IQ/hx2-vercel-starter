import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(status: number, error: string, detail?: any) {
  return NextResponse.json({ ok: false, error, ...(detail ? { detail } : {}) }, { status });
}

function safeParse(s: any) {
  if (typeof s !== "string") return s;
  try { return JSON.parse(s); } catch { return null; }
}

// Public-safe projection ONLY
function toPublic(node: any) {
  if (!node || typeof node !== "object") return null;
  return {
    id: String(node.id || ""),
    type: node.type || null,
    version: node.version || null,
    description: node.description || null,
  };
}

export async function GET() {
  const redis = getRedis();
  if (!redis) return bad(500, "redis_not_configured");

  try {
    // Registry index written by install route
    const ids = (await redis.smembers("hx2:registry:nodes:index")) as any[] || [];
    const limited = ids.slice(0, 200); // safety cap

    const keys = limited.map((id) => `hx2:registry:nodes:${id}`);
    const raws = keys.length ? await redis.mget(...(keys as any)) : [];
    const nodes = (raws || [])
      .map(safeParse)
      .map(toPublic)
      .filter(Boolean);

    return NextResponse.json({
      ok: true,
      count: nodes.length,
      nodes,
      ts: new Date().toISOString(),
    });
  } catch (e: any) {
    return bad(500, "internal_error", { message: String(e?.message || e) });
  }
}
