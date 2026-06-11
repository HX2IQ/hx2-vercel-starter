import { NextResponse } from "next/server";
import { buildKgxPredictionPromotionDeltaIntelligence } from "../_lib/kgx-prediction-promotion-delta-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const delta =
    await buildKgxPredictionPromotionDeltaIntelligence();

  return NextResponse.json({
    ok: true,
    kgx_prediction_promotion_delta_intelligence_active: true,
    delta
  });
}
