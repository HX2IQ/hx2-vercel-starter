import { NextResponse } from "next/server";
import { buildKgxPredictionPromotionCalibrationIntelligence } from "../_lib/kgx-prediction-promotion-calibration-intelligence";
import { buildKgxPredictionPromotionCalibrationAuditTrail } from "../_lib/kgx-prediction-promotion-calibration-audit-trail";

export const dynamic = "force-dynamic";

export async function GET() {
  const calibration =
    await buildKgxPredictionPromotionCalibrationIntelligence();

  return NextResponse.json({
    ok: true,
    kgx_prediction_promotion_calibration_audit_active: true,
    audit:
      buildKgxPredictionPromotionCalibrationAuditTrail(calibration)
  });
}
