import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(status: number, error: string, detail?: any) {
  return NextResponse.json({ ok: false, error, ...(detail ? { detail } : {}) }, { status });
}

function safeJsonParse(v: any) {
  if (v == null) return null;
  if (typeof v === "object") return v;
  if (typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return v; }
}

export async function GET(
  _req: NextRequest,
  ctx: { params: { nodeId?: string } }
) {
  const nodeId = ctx?.params?.nodeId;
  if (!nodeId) return bad(400, "missing_nodeId");

  const redis = getRedis();
  if (!redis) return bad(500, "redis_not_configured");

  try {
    const key = `hx2:registry:nodes:${nodeId}`;
    const raw: any = await redis.get(key);

    if (!raw) return bad(404, "not_found", { nodeId });

    const node = safeJsonParse(raw);

    // If we stored JSON string, node is an object now. If it was stored as plain string, fail loudly.
    if (!node || typeof node !== "object") {
      return bad(500, "bad_record_json", { nodeId, raw });
    }

    return NextResponse.json({ ok: true, nodeId, node, ts: new Date().toISOString() });
  } catch (e: any) {
    return bad(500, "internal_error", { message: String(e?.message || e) });
  }
}
