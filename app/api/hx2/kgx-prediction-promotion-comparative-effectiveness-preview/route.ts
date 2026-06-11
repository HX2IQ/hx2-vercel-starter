import { NextResponse } from "next/server";
import { buildKgxPredictionPromotionComparativeEffectiveness } from "../_lib/kgx-prediction-promotion-comparative-effectiveness";

export const dynamic = "force-dynamic";

export async function GET() {
  const comparative =
    await buildKgxPredictionPromotionComparativeEffectiveness();

  return NextResponse.json({
    ok: true,
    kgx_prediction_promotion_comparative_effectiveness_active: true,
    comparative
  });
}
