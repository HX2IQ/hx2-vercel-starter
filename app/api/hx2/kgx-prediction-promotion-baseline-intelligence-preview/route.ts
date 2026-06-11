import { NextResponse } from "next/server";
import { buildKgxPredictionPromotionBaselineIntelligence } from "../_lib/kgx-prediction-promotion-baseline-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseline =
    await buildKgxPredictionPromotionBaselineIntelligence();

  return NextResponse.json({
    ok: true,
    kgx_prediction_promotion_baseline_intelligence_active: true,
    baseline
  });
}
