import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


const BUILD_STAMP = "install-route-1768697626";
function bad(status: number, error: string, detail?: any) {
  return NextResponse.json({ ok: false, error, ...(detail ? { detail } : {}) }, { status });
}

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

    
    const expected = (process.env.HX2_API_KEY || "").trim();
if (!expected) return bad(500, "missing_server_key");
    if (!token || token !== expected) return bad(401, "unauthorized", { stamp: BUILD_STAMP, gotLen: token.length, hasServerKey: !!process.env.HX2_API_KEY });

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return bad(400, "bad_json");

    const node = (body as any).node;
    const nodeId = node?.id;
    if (!nodeId || typeof nodeId !== "string") return bad(400, "missing_node_id");

    const now = new Date().toISOString();
    const record = { ...node, id: nodeId, updatedAt: now, createdAt: node.createdAt || now };

    await redis.set(`hx2:registry:nodes:${nodeId}`, JSON.stringify(record));
    await redis.sadd("hx2:registry:nodes:index", nodeId);

    return NextResponse.json({ ok: true, installed: true, nodeId, ts: now }, { status: 200 });
  } catch (e: any) {
    return bad(500, "internal_error", String(e?.message || e));
  }
}






