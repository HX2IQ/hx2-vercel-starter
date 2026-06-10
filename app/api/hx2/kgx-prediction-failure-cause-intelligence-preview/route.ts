import { NextResponse } from "next/server";
import { buildKgxPredictionFailureCauseIntelligence } from "../_lib/kgx-prediction-failure-cause-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const intelligence =
    await buildKgxPredictionFailureCauseIntelligence();

  return NextResponse.json({
    ok: true,
    kgx_prediction_failure_cause_intelligence_active: true,
    intelligence
  });
}
