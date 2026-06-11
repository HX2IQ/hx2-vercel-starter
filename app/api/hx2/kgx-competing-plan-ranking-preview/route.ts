import { NextResponse } from "next/server";
import { buildKgxCompetingPlanRanking } from "../_lib/kgx-competing-plan-ranking";

export const dynamic = "force-dynamic";

export async function GET() {
  const ranking =
    await buildKgxCompetingPlanRanking();

  return NextResponse.json({
    ok: true,
    competing_plan_ranking_active: true,
    ranking
  });
}
