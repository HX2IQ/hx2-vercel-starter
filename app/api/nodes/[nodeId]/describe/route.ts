import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(status: number, error: string, detail?: any) {
  return NextResponse.json({ ok: false, error, ...(detail ? { detail } : {}) }, { status });
}

export async function GET(_req: Request, ctx: { params: { nodeId: string } }) {
  try {
    const nodeId = (ctx?.params?.nodeId || "").trim();
    if (!nodeId) return bad(400, "missing_nodeId");

    const raw = await redis.get(`hx2:registry:nodes:${nodeId}`);
    if (!raw) return bad(404, "not_found", { nodeId });

    let node: any = null;
    try {
      node = typeof raw === "string" ? JSON.parse(raw) : JSON.parse(String(raw));
    } catch {
      return bad(500, "bad_record_json", { nodeId });
    }

    return NextResponse.json({
      ok: true,
      route: "nodes.node.describe",
      nodeId,
      node,
      routes: [
        `/api/nodes/${nodeId}/ping`,
        `/api/nodes/${nodeId}/describe`,
      ],
      ts: new Date().toISOString(),
    });
  } catch (e: any) {
    return bad(500, "internal_error", { message: String(e?.message || e) });
  }
}
