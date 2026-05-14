import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

function getRedis() {
  const rawUrl =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    "";
  const rawToken =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    "";

  const url = rawUrl.trim();
  const token = rawToken.trim();

  if (!url || !token) return null;
  return new Redis({ url, token });
}

const DEFAULT_POLICY = {
  enabled: false,
  mode: "safe_only",
  safe_actions: ["owner_summary", "drift_dashboard", "regression_smoke"],
  blocked_actions: ["postflight", "deploy", "chain_reset"],
  rules: {
    require_green_state: true,
    require_ready_step: true,
    require_owner_enable: true
  }
};

export async function GET() {
  try {
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ ok: true, ...DEFAULT_POLICY });
    }

    const raw = await redis.get("owner:autopilot_policy");
    if (!raw) {
      return NextResponse.json({ ok: true, ...DEFAULT_POLICY });
    }

    const policy = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json({ ok: true, ...DEFAULT_POLICY, ...policy });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const enabled = !!body?.enabled;

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(
        { ok: false, error: "Redis not configured" },
        { status: 500 }
      );
    }

    const policy = {
      ...DEFAULT_POLICY,
      enabled,
      updated_at: new Date().toISOString()
    };

    await redis.set("owner:autopilot_policy", JSON.stringify(policy));

    return NextResponse.json({ ok: true, ...policy });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

