import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const node = body?.node;

    if (!node?.id) {
      return NextResponse.json({ ok: false, error: "Invalid node" });
    }

    const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim();
    const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

    if (!url || !token) {
      return NextResponse.json({ ok: false, error: "Missing Redis config" });
    }

    const redis = new Redis({ url, token });

    // 🔥 Execution logic (placeholder intelligence)
    const result = {
      node_id: node.id,
      executed_at: new Date().toISOString(),
      outcome: "success",
      insight: `Node ${node.id} executed successfully`,
    };

    // store execution history
    await redis.lpush("owner:node_execution_history", JSON.stringify(result));
    await redis.ltrim("owner:node_execution_history", 0, 99);

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || "failed",
    });
  }
}
