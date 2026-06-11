import { NextResponse } from "next/server";
import { buildKgxPredictionRegimeIntelligence } from "../_lib/kgx-prediction-regime-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const regimes =
    await buildKgxPredictionRegimeIntelligence();

  return NextResponse.json({
    ok: true,
    kgx_prediction_regime_intelligence_active: true,
    regimes
  });
}
