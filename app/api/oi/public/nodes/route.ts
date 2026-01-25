import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ok(data: any) {
  return NextResponse.json({ ok: true, ...data, ts: new Date().toISOString() });
}
function bad(status: number, error: string, detail?: any) {
  return NextResponse.json({ ok: false, error, ...(detail ? { detail } : {}) }, { status });
}

function sanitize(node: any) {
  if (!node || typeof node !== "object") return null;
  return {
    id: String(node.id || ""),
    type: String(node.type || ""),
    version: String(node.version || ""),
    description: String(node.description || ""),
  };
}

export async function GET() {
  const redis = getRedis();
  if (!redis) return ok({ nodes: [], note: "redis_not_configured" });

  try {
    const ids = (await redis.smembers("hx2:registry:nodes:index").catch(() => [])) as any[];
    const uniq = Array.from(new Set((ids || []).map(String))).filter(Boolean).sort();

    const nodes: any[] = [];
    for (const id of uniq) {
      const raw = await redis.get(`hx2:registry:nodes:${id}`).catch(() => null);
      if (!raw) continue;

      let parsed: any = null;
      try {
        parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        // skip bad json record
        continue;
      }

      const s = sanitize(parsed);
      if (s && s.id) nodes.push(s);
    }

    return ok({ count: nodes.length, nodes });
  } catch (e: any) {
    return bad(500, "internal_error", { message: String(e?.message || e) });
  }
}
