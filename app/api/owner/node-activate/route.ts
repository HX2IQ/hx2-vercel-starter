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

    const url = String(
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.KV_REST_API_URL ||
      ""
    ).trim();

    const token = String(
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      process.env.KV_REST_API_TOKEN ||
      ""
    ).trim();

    if (!url || !token) {
      return NextResponse.json({ ok: false, error: "Missing Redis config" });
    }

    const redis = new Redis({ url, token });

    const activeNode = {
      ...node,
      status: "active",
      activated_at: new Date().toISOString(),
    };

    await redis.lpush("owner:active_nodes", JSON.stringify(activeNode));
    await redis.ltrim("owner:active_nodes", 0, 49);

    return NextResponse.json({
      ok: true,
      node: activeNode,
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || "failed",
    });
  }
}
