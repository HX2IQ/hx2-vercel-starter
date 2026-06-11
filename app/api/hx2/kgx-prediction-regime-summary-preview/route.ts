import { NextResponse } from "next/server";
import { buildKgxPredictionRegimeSummary } from "../_lib/kgx-prediction-regime-summary";

export const dynamic = "force-dynamic";

export async function GET() {
  const summary =
    await buildKgxPredictionRegimeSummary();

  return NextResponse.json({
    ok: true,
    kgx_prediction_regime_summary_active: true,
    summary
  });
}
