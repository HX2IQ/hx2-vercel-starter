import { NextResponse } from "next/server";
import { buildKgxPredictionPromotionFailureAttribution } from "../_lib/kgx-prediction-promotion-failure-attribution";

export const dynamic = "force-dynamic";

export async function GET() {
  const attribution =
    await buildKgxPredictionPromotionFailureAttribution();

  return NextResponse.json({
    ok: true,
    kgx_prediction_promotion_failure_attribution_active: true,
    attribution
  });
}
