import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export async function GET() {
  const redis = getRedis();

  return NextResponse.json({
    ok: true,
    capabilities: {
      redis: !!redis,
      ap2: !!process.env.AP2_WORKER_BASE_URL,
      registry: true,
      self_build_ready: !!redis && !!process.env.AP2_WORKER_BASE_URL
    }
  });
}