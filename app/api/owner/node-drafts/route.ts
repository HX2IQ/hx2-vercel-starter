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
      return NextResponse.json({ ok: false, drafts: [] });
    }

    const redis = new Redis({ url, token });

    const raw = await redis.lrange("owner:node_scaffold_drafts", 0, 49);

    const drafts = (raw || []).map((item: any) => {
      try {
        return typeof item === "string" ? JSON.parse(item) : item;
      } catch {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({
      ok: true,
      count: drafts.length,
      drafts,
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || "failed",
      drafts: [],
    });
  }
}
