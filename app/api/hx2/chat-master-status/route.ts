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

  const checks = {
    chat_master_route:
      exists("app/api/hx2/chat-master/route.ts"),

    router_route:
      exists("app/api/hx2/router/route.ts"),

    execute_route:
      exists("app/api/hx2/execute/route.ts"),

    owner_console:
      exists("app/owner-console/page.tsx")
  };

  const healthy =
    Object.values(checks).filter(Boolean).length;

  const total =
    Object.keys(checks).length;

  const readiness =
    total > 0
      ? Math.round((healthy / total) * 100)
      : 0;

  return NextResponse.json({
    ok: true,

    chat_master: {
      readiness_percent: readiness,
      healthy_checks: healthy,
      total_checks: total,
      checks
    }
  });
}
