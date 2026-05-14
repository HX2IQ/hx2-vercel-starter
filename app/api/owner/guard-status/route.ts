import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  const guards = [
    "tools/owner-console-layout-guard.ps1",
    "tools/guard-hx2-grand-design.ps1",
    "tools/guard-hx2-syntax.ps1",
    "tools/hx2-benchmark-guard.ps1",
  ];

  const root = process.cwd();

  return NextResponse.json({
    ok: true,
    command: "npm run hx2:guard",
    master_guard: "tools/hx2-master-guard.ps1",
    guards: guards.map((guard) => {
      const full = path.join(root, guard);
      return {
        guard,
        exists: fs.existsSync(full),
      };
    }),
    checked_utc: new Date().toISOString(),
  });
}
