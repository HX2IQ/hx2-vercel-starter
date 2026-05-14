import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

export async function GET() {
  try {
    const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim();
    const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

    if (!url || !token) {
      return NextResponse.json({ ok: false, nodes: [] });
    }

    const redis = new Redis({ url, token });

    const raw = await redis.lrange("owner:active_nodes", 0, 49);

    const nodes = (raw || []).map((item: any) => {
      try {
        return typeof item === "string" ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({
      ok: true,
      count: nodes.length,
      nodes,
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || "failed",
      nodes: [],
    });
  }
}
