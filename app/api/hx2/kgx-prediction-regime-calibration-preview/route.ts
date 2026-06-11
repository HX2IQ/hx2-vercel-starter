import { NextResponse } from "next/server";
import { buildKgxPredictionRegimeCalibration } from "../_lib/kgx-prediction-regime-calibration";

export const dynamic = "force-dynamic";

export async function GET() {
  const calibration =
    await buildKgxPredictionRegimeCalibration();

  return NextResponse.json({
    ok: true,
    kgx_prediction_regime_calibration_active: true,
    calibration
  });
}
