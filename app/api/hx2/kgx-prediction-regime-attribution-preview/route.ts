import { NextResponse } from "next/server";
import { buildKgxPredictionRegimeAttribution } from "../_lib/kgx-prediction-regime-attribution";

export const dynamic = "force-dynamic";

export async function GET() {
  const attribution =
    await buildKgxPredictionRegimeAttribution();

  return NextResponse.json({
    ok: true,
    kgx_prediction_regime_attribution_active: true,
    attribution
  });
}
