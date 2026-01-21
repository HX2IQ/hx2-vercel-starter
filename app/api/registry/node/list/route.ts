import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(status: number, error: string, detail?: any) {
  return NextResponse.json({ ok: false, error, ...(detail ? { detail } : {}) }, { status });
}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    const expected = (process.env.HX2_API_KEY || "").trim();

    if (!expected) return bad(500, "missing_server_key");
    if (!token || token !== expected) return bad(401, "unauthorized");

    const ids = (await redis.smembers("hx2:registry:nodes:index")) || [];
    ids.sort();

    const keys = ids.map((id: string) => `hx2:registry:nodes:${id}`);
    const raw = keys.length ? await redis.mget(...keys) : [];

    const nodes = (raw || [])
      .map((v: any) => {
        if (!v) return null;
        try { return JSON.parse(v); } catch { return null; }
      })
      .filter(Boolean);

    return NextResponse.json(
      { ok: true, route: "registry.node.list", count: nodes.length, nodes, ts: new Date().toISOString() },
      { status: 200 }
    );
  } catch (e: any) {
    return bad(500, "internal_error", String(e?.message || e));
  }
}

export async function POST() {
  return NextResponse.json({ ok: false, error: "method_not_allowed", allow: ["GET"] }, { status: 405 });
}
