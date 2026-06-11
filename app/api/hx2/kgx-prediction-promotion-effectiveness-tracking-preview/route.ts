import { NextResponse } from "next/server";
import { buildKgxPredictionPromotionEffectivenessTracking } from "../_lib/kgx-prediction-promotion-effectiveness-tracking";

export const dynamic = "force-dynamic";

export async function GET() {
  const tracking =
    await buildKgxPredictionPromotionEffectivenessTracking();

  return NextResponse.json({
    ok: true,
    kgx_prediction_promotion_effectiveness_tracking_active: true,
    tracking
  });
}
