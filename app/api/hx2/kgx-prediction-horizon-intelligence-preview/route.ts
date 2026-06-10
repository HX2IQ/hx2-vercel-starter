import { NextResponse } from "next/server";
import { buildKgxPredictionHorizonIntelligence } from "../_lib/kgx-prediction-horizon-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const horizon =
    await buildKgxPredictionHorizonIntelligence();

  return NextResponse.json({
    ok: true,
    kgx_prediction_horizon_intelligence_active: true,
    horizon
  });
}
