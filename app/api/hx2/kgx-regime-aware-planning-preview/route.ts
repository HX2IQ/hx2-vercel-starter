import { NextResponse } from "next/server";
import { buildKgxRegimeAwarePlanning } from "../_lib/kgx-regime-aware-planning";

export const dynamic = "force-dynamic";

export async function GET() {
  const planning =
    await buildKgxRegimeAwarePlanning();

  return NextResponse.json({
    ok: true,
    regime_aware_planning_active: true,
    planning
  });
}
