import { NextResponse } from "next/server";
import { buildKgxPredictionPromotionSuccessAttribution } from "../_lib/kgx-prediction-promotion-success-attribution";

export const dynamic = "force-dynamic";

export async function GET() {
  const attribution =
    await buildKgxPredictionPromotionSuccessAttribution();

  return NextResponse.json({
    ok: true,
    kgx_prediction_promotion_success_attribution_active: true,
    attribution
  });
}
