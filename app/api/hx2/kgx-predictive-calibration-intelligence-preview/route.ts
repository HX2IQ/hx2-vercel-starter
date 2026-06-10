import { NextResponse } from "next/server";
import { buildKgxPredictiveCalibrationIntelligence } from "../_lib/kgx-predictive-calibration-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const calibration =
    await buildKgxPredictiveCalibrationIntelligence();

  return NextResponse.json({
    ok: true,
    kgx_predictive_calibration_intelligence_active: true,
    calibration
  });
}
