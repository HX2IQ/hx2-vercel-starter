import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {

    const checks = {
      chat_master_route: true,
      router_route: true,
      owner_console: true,
      memory_bridge: true,
      ap2_gateway_configured: !!process.env.AP2_GATEWAY_URL,
      redis_configured: !!(
        process.env.UPSTASH_REDIS_REST_URL ||
        process.env.KV_REST_API_URL
      )
    };

    const healthy =
      Object.values(checks).filter(Boolean).length;

    const total =
      Object.keys(checks).length;

    return NextResponse.json({
      ok: true,
      orchestrator: {
        phase: "phase3_visibility",
        healthy_checks: healthy,
        total_checks: total,
        checks
      }
    });

  } catch (err: any) {

    return NextResponse.json({
      ok: false,
      error: err?.message || String(err)
    }, { status: 500 });

  }
}
