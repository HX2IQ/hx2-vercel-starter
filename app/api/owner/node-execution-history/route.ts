import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

export async function GET() {
  try {
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
      return NextResponse.json({ ok: true, items: [] });
    }

    const redis = new Redis({ url, token });
    const raw = await redis.lrange("owner:node_execution_history", 0, 19);

    const items = (raw || [])
      .map((x: any) => {
        try {
          return typeof x === "string" ? JSON.parse(x) : x;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err), items: [] },
      { status: 500 }
    );
  }
}
