import { NextResponse } from "next/server";
import { buildKgxRuntimeHealthAuthority } from "../_lib/kgx-runtime-health-authority";

export const dynamic = "force-dynamic";

export async function GET() {
  const health =
    await buildKgxRuntimeHealthAuthority();

  return NextResponse.json({
    ok: true,
    kgx_runtime_health_authority_active: true,
    health
  });
}
