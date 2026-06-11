import { NextResponse } from "next/server";
import { buildKgxRecommendationAdjustmentEngine } from "../_lib/kgx-recommendation-adjustment-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const adjustment =
    await buildKgxRecommendationAdjustmentEngine();

  return NextResponse.json({
    ok: true,
    recommendation_adjustment_engine_active: true,
    adjustment
  });
}
