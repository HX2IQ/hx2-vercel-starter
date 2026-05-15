import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function exists(p: string) {
  try {
    return fs.existsSync(path.join(process.cwd(), p));
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const checks = {
      chat_master_route: exists("app/api/hx2/chat-master/route.ts"),
      router_route: exists("app/api/hx2/router/route.ts"),
      execute_route: exists("app/api/hx2/execute/route.ts"),
      registry_preview_route: exists("app/api/hx2/registry/preview/route.ts"),
      memory_status_route: exists("app/api/brain/memory/status/route.ts"),
      owner_console: exists("app/owner-console/page.tsx"),
      ap2_gateway_configured: !!process.env.AP2_GATEWAY_URL,
      redis_configured: !!(
        process.env.UPSTASH_REDIS_REST_URL ||
        process.env.KV_REST_API_URL
      ),
    };

    const healthy = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    return NextResponse.json({
      ok: true,
      orchestrator: {
        phase: "phase3_visibility",
        healthy_checks: healthy,
        total_checks: total,
        checks,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
