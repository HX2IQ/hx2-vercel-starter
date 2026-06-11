import { NextResponse } from "next/server";
import { buildKgxCostGuardAuthority } from "../_lib/kgx-cost-guard-authority";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard =
    await buildKgxCostGuardAuthority();

  return NextResponse.json({
    ok: true,
    kgx_cost_guard_authority_active: true,
    guard
  });
}
