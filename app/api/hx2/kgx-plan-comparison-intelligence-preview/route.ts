import { NextResponse } from "next/server";
import { buildKgxPlanComparisonIntelligence } from "../_lib/kgx-plan-comparison-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const comparison =
    await buildKgxPlanComparisonIntelligence();

  return NextResponse.json({
    ok: true,
    plan_comparison_intelligence_active: true,
    comparison
  });
}
