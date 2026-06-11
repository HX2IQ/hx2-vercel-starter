import { NextResponse } from "next/server";
import { buildKgxPlanScoringIntelligence } from "../_lib/kgx-plan-scoring-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const scoring =
    await buildKgxPlanScoringIntelligence();

  return NextResponse.json({
    ok: true,
    plan_scoring_intelligence_active: true,
    scoring
  });
}
