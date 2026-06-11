import { NextResponse } from "next/server";
import { buildKgxStrategicRecommendationIntelligence } from "../_lib/kgx-strategic-recommendation-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const recommendation =
    await buildKgxStrategicRecommendationIntelligence();

  return NextResponse.json({
    ok: true,
    strategic_recommendation_intelligence_active: true,
    recommendation
  });
}
