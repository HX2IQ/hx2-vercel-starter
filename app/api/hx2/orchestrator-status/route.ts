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

function percent(group: Record<string, boolean>) {
  const values = Object.values(group);
  if (values.length === 0) return 0;
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}

function missing(group: Record<string, boolean>) {
  return Object.entries(group)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
}

export async function GET() {
  try {
    const critical_checks = {
      chat_master_route: exists("app/api/hx2/chat-master/route.ts"),
      router_route: exists("app/api/hx2/router/route.ts"),
      chat_master_foundation:
        exists("app/api/hx2/chat-master/route.ts") &&
        exists("app/api/hx2/router/route.ts") &&
        exists("app/api/hx2/execute/route.ts"),
      execute_route: exists("app/api/hx2/execute/route.ts"),
      redis_configured: !!(
        process.env.UPSTASH_REDIS_REST_URL ||
        process.env.KV_REST_API_URL
      ),
    };

    const optional_checks = {
      owner_console: exists("app/owner-console/page.tsx"),
      registry_preview_route: exists("app/api/hx2/registry/preview/route.ts"),
      memory_status_route: exists("app/api/brain/memory/status/route.ts"),
      ap2_gateway_configured: !!process.env.AP2_GATEWAY_URL,
    };

    const checks = { ...critical_checks, ...optional_checks };

    const healthy = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    const missing_routes = missing(checks);
    const missing_critical = missing(critical_checks);
    const missing_optional = missing(optional_checks);

    const readiness_percent =
      total > 0 ? Math.round((healthy / total) * 100) : 0;

    const critical_readiness_percent = percent(critical_checks);
    const optional_readiness_percent = percent(optional_checks);

    const severity =
      critical_readiness_percent < 100
        ? "critical"
        : readiness_percent < 80
        ? "degraded"
        : "healthy";

    return NextResponse.json({
      ok: true,
      orchestrator: {
        phase: "phase3_visibility",
        healthy_checks: healthy,
        total_checks: total,
        missing_routes,
        missing_critical,
        missing_optional,
        readiness_percent,
        critical_readiness_percent,
        optional_readiness_percent,
        severity,
        critical_checks,
        optional_checks,
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


