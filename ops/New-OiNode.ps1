param(
  [Parameter(Mandatory=$true)]
  [ValidatePattern("^[a-z0-9-]+$")]
  [string]$Id
)

function Write-File($Path, $Content) {
  New-Item -ItemType Directory -Force -Path (Split-Path $Path) | Out-Null
  $Content | Set-Content -Encoding UTF8 $Path
  Write-Host "Wrote: $Path"
}

$root = "app\api\nodes\$Id"

Write-File "$root\route.ts" @"
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    node: "$Id",
    message: "$Id from OI",
    ts: new Date().toISOString()
  });
}
"@

Write-File "$root\health\route.ts" @"
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    node: "$Id",
    status: "healthy",
    ts: new Date().toISOString()
  });
}
"@

Write-File "$root\run\route.ts" @"
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      ok: true,
      node: "$Id",
      mode: "SAFE",
      received: body ?? {},
      ts: new Date().toISOString()
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, node: "$Id", error: e?.message || "unknown_error" },
      { status: 500 }
    );
  }
}
"@

Write-Host "`nDone. Next:"
Write-Host "  git add app/api/nodes/$Id"
Write-Host "  git commit -m `"Add $Id node endpoints`""
