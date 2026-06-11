import { NextResponse } from "next/server";
import { buildKgxPredictionPromotionCalibrationIntelligence } from "../_lib/kgx-prediction-promotion-calibration-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const calibration =
    await buildKgxPredictionPromotionCalibrationIntelligence();

  return NextResponse.json({
    ok: true,
    kgx_prediction_promotion_calibration_intelligence_active: true,
    calibration
  });
}
